import { supabase } from '../supabaseClient';
import { cacheGet, cacheSet, cacheDelete } from '../lib/cache.js'; 

export default class FetchDAL {

    static async getCategories() {
        console.log("--- Executing Category fetch ---");
        try {
            const { data, error } = await supabase.rpc('get_categories');
            
            if (error) throw error;
            return data || [];
            
        } catch (error) {
            console.error('Error fetching categories:', error.message);
            return [];
        }
    }

    static async addCategory(categoryName) {
        console.log('Adding new category via RPC:', categoryName);
        try {
            const { data: newId, error } = await supabase.rpc('add_category', { 
                p_name: categoryName 
            });
            
            if (error) throw error;
            return { success: true, id: newId };
            
        } catch (error) {
            console.error('Add Category Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async editCategory(categoryId, categoryName) {
        console.log('Updating category via RPC:', categoryId);
        try {
            const { data: success, error } = await supabase.rpc('edit_category', { 
                p_id: categoryId, 
                p_name: categoryName 
            });
            
            if (error) throw error;
            if (!success) console.warn('Category update failed: Category not found.');
            
            return { success };
            
        } catch (error) {
            console.error('Update Category Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async deleteCategory(categoryId) {
        console.log('Deleting category via RPC:', categoryId);
        try {
            const { data: success, error } = await supabase.rpc('delete_category', { 
                p_id: categoryId 
            });
            
            if (error) throw error;
            if (!success) console.warn('Category delete failed: Category not found.');
            
            return { success };
            
        } catch (error) {
            console.error('Delete Category Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async invalidateBookingCaches(userID, roomID = null) {
        const keysToDelete = [
            `bookings:user:${userID}`,
            'bookings:all' 
        ];
        
        if (roomID) {
            keysToDelete.push(`bookings:room:${roomID}`);
        }

        console.log('Invalidating booking caches:', keysToDelete);
        
        await Promise.all(keysToDelete.map(key => cacheDelete(key)));
    }
    
    static async getAllUsers() {
        try {
            const { data, error } = await supabase.rpc('get_users_in_my_org');

            if (error) throw error;
            
            console.log('My Organization Users:', data);
            return data;
            
        } catch (error) {
            console.error('Error fetching users:', error.message);
            return null;
        }
    }

    static async getUserData() 
    {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            console.log(error.message)
            return null
        }
        else {
            console.log('Current user', data.user)
            return data.user
        }
    }
    static isWeekend(date) {
        if (date.getDay() === 6 || date.getDay() === 0) {
            return true
        }
    }
    static async getCurrentUser() {
        try {
            const { data, error } = await supabase
                .rpc('get_my_profile')
                .single(); 

            if (error) throw error;
            
            console.log('SUCCESS: MY PROFILE', data);
            return data;
            
        } catch (error) {
            console.error('Error fetching current user:', error.message);
            return null;
        }
    }

    static async loggedInOrgID() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error || !session) throw error || new Error("No active session");
            let result = session.user.app_metadata.organisation_id;
            console.log('RESULT (from JWT):', result);
            return result;
            
        } catch (error) {
            console.error('Error reading JWT for Org ID:', error.message);
            return null;
        }
    }

    static async makeAdmin(userID) {
        console.log('1. UserID to be admin', userID);
        try {
            console.log('2. Firing Edge Function...');
            const response = await supabase.functions.invoke('update-user-role', {
                body: { target_user_id: userID, new_role: 'admin' }
            });
            
            console.log('3. Edge Function Raw Response:', response);
            
            if (response.error) throw response.error;
            
        }
        catch (error) {
            console.error('4. Error making admin:', error);
        }
    }

    static async removeAdmin(userID) {
        console.log('1. UserID to have admin revoked', userID);
        try {
            console.log('2. Firing Edge Function...');
            const response = await supabase.functions.invoke('update-user-role', {
                body: { target_user_id: userID, new_role: 'standard' }
            });
            
            console.log('3. Edge Function Raw Response:', response);
            
            if (response.error) throw response.error;
            
        }
        catch (error) {
            console.error('4. Error removing admin:', error);
        }
    }

    static async approveUser(userID){
        console.log('Approving user via RPC')
        try {
            const { error } = await supabase.rpc('approve_user', {
                target_user_id: userID
            })
            if (error) throw error;
        }
        catch (error) {
            console.log(error.message)
        }
    }

    static async checkWeekendDate(checkDate){
        if (this.isWeekend(checkDate)) {
            let jump = (checkDate.getDay() === 6) ? 2 : 1;
            checkDate.setDate(checkDate.getDate() + jump);
        }
        return checkDate
    }

    static async executeSecureBooking(roomID, datesArray, duration, title, description) {
        try {
            const user = await this.getUserData();
            if (!user) {
                return { isValid: false, error: "Not authenticated." };
            }

            const [startTime, endTime] = duration.split(" - ");

            const { data, error } = await supabase.rpc('create_bookings_batch', {
                p_room_id: parseInt(roomID),
                p_booking_dates: datesArray,
                p_start_time: startTime + ':00',
                p_end_time: endTime + ':00',
                p_title: title,
                p_description: description
                // no p_user_id, no p_created_time — server derives/sets these itself
            });

            if (error) throw error;

            if (!data.success) {
                console.error(data.error);
                return { isValid: false, error: data.error };
            }

            await this.invalidateBookingCaches(user.id, roomID);
            return { isValid: true };

        } catch (error) {
            console.error("Booking Error:", error.message);
            return { isValid: false, error: "System error occurred." };
        }
    }

    static async createDailyBooking(description, roomID, startBookingDate, duration, title, recurrenceLength) {
        let checkDate = new Date(startBookingDate);
        let datesToBook = [];

        while (datesToBook.length < recurrenceLength) {
            if (this.isWeekend(checkDate)) {
                let jump = (checkDate.getDay() === 6) ? 2 : 0;
                checkDate.setDate(checkDate.getDate() + jump);
            }
            datesToBook.push(checkDate.toISOString().split('T')[0]);
            checkDate.setDate(checkDate.getDate() + 1);
        }

        return await this.executeSecureBooking(roomID, datesToBook, duration, title, description);
    }

    static async createBooking(description, roomID, bookingDate, duration, title) {
        return await this.executeSecureBooking(roomID, [bookingDate], duration, title, description);
    }
    static formatDates(dateList){
        let formattedList = []
        for (let i = 0; i < dateList.length; i++) {
            const d = dateList[i];
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            
            formattedList.push(`${year}-${month}-${day}`);
        }
        return formattedList
    }

    static async getUserPublicInfo(userId) {
        try {
            const { data, error } = await supabase
                .rpc('get_user_public_info', { p_user_id: userId })
                .single();

            if (error) throw error;
            return data;

        } catch (error) {
            console.error('User lookup failed:', error.message);
            return null;
        }
    }

    static async createMonthlyRecurringBooking(description, roomID, bookingDate, duration, title, frequency, recurrenceLength, monthlyOrdinal, monthlyWeekday, monthlyType, skipweekend) {
        let datesToBook = [];

        if (monthlyType.toLowerCase() === 'fixed') {
            let tempDate = new Date(bookingDate);
            const originalDay = tempDate.getDate(); 

            for (let i = 0; i < recurrenceLength; i++) {
                datesToBook.push(tempDate.toISOString().split('T')[0]);
                tempDate.setMonth(tempDate.getMonth() + 1);
                
                if (tempDate.getDate() !== originalDay) {
                    tempDate.setDate(0); 
                }
            }
        } 
        else if (monthlyType.toLowerCase() === 'ordinal') {
            let bookingDates = await this.createOrdinalDates(bookingDate, monthlyWeekday, monthlyOrdinal, recurrenceLength, skipweekend);
            datesToBook = this.formatDates(bookingDates); 
        }

        if (datesToBook.length === 0) {
            return { isValid: false, error: "Could not generate valid dates." };
        }

        return await this.executeSecureBooking(roomID, datesToBook, duration, title, description);
    }

    static createOrdinalDates(bookingDate, targetDay, targetOrdinal, recurrenceLength, skipweekend) {
        try{
            let results = [];
            let startDay = new Date(bookingDate);
            
            let currentYear = startDay.getFullYear();
            let currentMonth = startDay.getMonth();

            for (let i = 0; i < recurrenceLength; i++) {
                let searchDate = new Date(currentYear, currentMonth, 1);
                let occurrenceCounter = 0;
                let foundForThisMonth = false;

                while (searchDate.getMonth() === currentMonth) {
                    if (searchDate.getDay() === parseInt(targetDay)) {
                        if(!skipweekend){
                            occurrenceCounter++;
                            if (occurrenceCounter === parseInt(targetOrdinal)) {
                                results.push(new Date(searchDate));
                                foundForThisMonth = true;
                                break; 
                            }
                        }
                        else{
                            updatedDate = this.checkWeekendDate(targetDay)
                            occurrenceCounter++;
                            if (occurrenceCounter === parseInt(targetOrdinal)) {
                                results.push(new Date(updatedDate));
                                foundForThisMonth = true;
                                break; 
                            }
                        }
                        
                    }
                    searchDate.setDate(searchDate.getDate() + 1);
                }

                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
            }

            return results;
        }
        catch(error){
            console.log(error.message)
            return false
        }
    }
    static async createWeeklyBooking(description, roomID, bookingDate, duration, title, recurrenceLength) {
        let spacing = 7;
        let datesToBook = [];
        
        for (let index = 0; index < recurrenceLength; index++) {
            let date = new Date(bookingDate);
            date.setDate(date.getDate() + (spacing * index));
            datesToBook.push(date.toISOString().split('T')[0]);
        }

        return await this.executeSecureBooking(roomID, datesToBook, duration, title, description);
    }

    static async createRecurringBooking(description, roomID, bookingDate, duration, title, frequency, recurrenceLength, skipweekend) {
        const freq = frequency.toLowerCase();

        if (freq === 'daily') {
            return await this.createDailyBooking(description, roomID, bookingDate, duration, title, recurrenceLength);
        }
        else if (freq === 'weekly') {
            return await this.createWeeklyBooking(description, roomID, bookingDate, duration, title, recurrenceLength);
        }
    }

    static async updateBooking(bookingID, title, description) {
        console.log('Updating:', bookingID, title, description);
        try {
            const { data: success, error } = await supabase
                .rpc('update_my_booking', {
                    p_booking_id: bookingID,
                    p_title: title,
                    p_description: description
                });
            
            if (error) {
                console.error('Database error:', error.message);
                return;
            }

            if (!success) {
                console.warn('Update failed: Booking not found or permission denied.');
                return;
            }

            let user = await this.getUserData();
            if (user) {
                await this.invalidateBookingCaches(user.id);
            }

        } catch (error) {
            console.error('Caught error:', error.message);
        }
    }
    static async fetchUserBookings(userId) {
        const cacheKey = `bookings:user:${userId}`;
        const cachedBookings = await cacheGet(cacheKey);
        if (cachedBookings) return cachedBookings;

        const { data, error } = await supabase.rpc('get_my_bookings');
        if (error) throw error;
        
        // Map the flat SQL response back into the nested shape the UI expects
        const formattedData = (data || []).map(b => ({
            ...b,
            Room: { RoomName: b.RoomName, Capacity: b.Capacity }
        }));

        await cacheSet(cacheKey, formattedData, 300); 
        return formattedData;
    }

    static async fetchBookings(bookingDate) {
        try {
            const { data, error } = await supabase.rpc('get_org_bookings_by_date', {
                p_date: bookingDate
            });
            if (error) throw error;

            const formattedData = (data || []).map(b => ({
                ...b,
                User: { Firstname: b.Firstname, Surname: b.Surname, UserEmail: b.UserEmail }
            }));

            console.log('Secure Date Bookings:', formattedData);
            return formattedData;

        } catch (error) {
            console.error('Fetch Date Bookings Error:', error.message);
        }
    }

    static async getAllBookings() {
        try {
            const { data, error } = await supabase.rpc('get_organisation_bookings_report');

            if (error) {
                console.error("Supabase RPC error fetching organization reports:", error.message);
                return [];
            }

            return data.map(b => ({
                BookingID: b.BookingID,
                Title: b.Title,
                BookingDate: b.BookingDate,
                BookingStartTime: b.BookingStartTime,
                BookingEndTime: b.BookingEndTime,
                Room: { RoomName: b.RoomName },
                User: { Firstname: b.Firstname, Surname: b.Surname }
            }));
            
        } catch (error) {
            console.error("Unexpected error in getting bookings:", error);
            return [];
        }
    }

    static async fetchBookingsWeek(roomID, startDate, endDate) {
        try {
            const { data, error } = await supabase.rpc('get_org_bookings_by_room', {
                p_room_id: parseInt(roomID),
                p_start_date: startDate,
                p_end_date: endDate
            });
            if (error) throw error;

            // Map user details into a nested object
            const formattedData = (data || []).map(b => ({
                ...b,
                User: { Firstname: b.Firstname, Surname: b.Surname, UserEmail: b.UserEmail }
            }));

            console.log(`Secure Week Bookings (Room ${roomID}):`, formattedData);
            return formattedData;

        } catch (error) {
            console.error('Fetch Week Bookings Error:', error.message);
        }
    }

    static async fetchAllBookings() {
        try {
            const { data, error } = await supabase.rpc('get_all_org_bookings');
            if (error) throw error;

            console.log('Secure All Org Bookings:', data);
            return data;
        } catch (error) {
            console.error('Fetch All Bookings Error:', error.message);
        }
    }

    static async GetSchools() {
        const cacheKey = 'orgs:schools:active';

        const cachedSchools = await cacheGet(cacheKey);
        if (cachedSchools) {
            console.log('SUCCESS (Cache): Schools');
            return cachedSchools;
        }

        console.log("--- Executing Secure RPC fetch ---");
        const { data, error } = await supabase.rpc('get_active_schools');

        if (error) {
            console.error('Error fetching active schools:', error.message);
            throw error;
        }
        
        await cacheSet(cacheKey, data, 3600);
        console.log('SUCCESS (DB):', data);
        
        return data;
    }
    static async getRooms() {
        console.log('Getting Rooms');
        let orgID = await this.loggedInOrgID();
        if (!orgID) return null;

        const cacheKey = `rooms:org:${orgID}`;
        
        const cachedRooms = await cacheGet(cacheKey);
        if (cachedRooms) return cachedRooms;

        const { data, error } = await supabase.rpc('get_rooms_in_my_org');

        if (error) {
            console.error('Error fetching rooms:', error.message);
            return null;
        }

        await cacheSet(cacheKey, data, 3600);
        return data;
    }
    static async AddNewRoom(title, location, capacity, features, categoryIds) {
        try {
            const { error } = await supabase.rpc('insert_room_admin', {
                p_room_name: title,
                p_location: location,
                p_capacity: parseInt(capacity),
                p_features: features,
                p_category_ids: categoryIds 
            });
                
            // If Supabase throws an error, catch it
            if (error) {
                console.error("Supabase RPC Error:", error);
                throw error;
            }

            // If no error, the room was added successfully!
            let orgID = await this.loggedInOrgID();
            
            // Only run cacheDelete if you actually have it imported!
            if (typeof cacheDelete === 'function') {
                await cacheDelete(`rooms:org:${orgID}`);
            }
            
            return { success: true };
            
        } catch (error) {
            console.error('Add Room Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async UpdateRooms(id, roomName, location, capacity, features, categoryIds) {
        console.log('Saving room changes', id, roomName);
        try {
            const { data: success, error } = await supabase.rpc('update_room_admin', {
                p_room_id: parseInt(id),
                p_room_name: roomName,
                p_location: location,
                p_capacity: parseInt(capacity),
                p_features: features,
                p_category_ids: categoryIds 
            });

            if (error) throw error;
            if (!success) {
                console.warn('Update rejected: Insufficient permissions or room not found.');
                return null;
            }

            let orgID = await this.loggedInOrgID();
            await cacheDelete(`rooms:org:${orgID}`);
            return true;
            
        } catch (error) {
            console.error('Update Room Error:', error.message);
            return null;
        }
    }

    static async deleteRoom(roomID) {
        try {
            const { data: success, error } = await supabase.rpc('delete_room_admin', {
                p_room_id: parseInt(roomID)
            });
            
            if (error) throw error;
            if (!success) {
                console.warn('Delete rejected: Insufficient permissions or room not found.');
                return;
            }

            let orgID = await this.loggedInOrgID();
            await cacheDelete(`rooms:org:${orgID}`);
            
        } catch (error) {
            console.error('Delete Room Error:', error.message);
        }
    }

    static async GetOrganisationID(Name) {
        console.log("--- Executing Secure Org ID fetch ---");
        try {
            const { data, error } = await supabase.rpc('get_organisation_id_by_name', {
                p_name: Name
            });

            if (error) throw error;
            if (!data) throw new Error("Organization not found");
            
            console.log('IMPORTANT:', data);
            return data;

        } catch (error) {
            console.error('Error fetching Organisation ID:', error.message);
            throw error;
        }
    }

    static async GetDepartments() {
        console.log("--- Executing Secure Dept fetch ---");
        try {
            const { data, error } = await supabase.rpc('get_departments_in_my_org');

            if (error) {
                throw error;
            } 
            
            console.log("Fetched Departments securely:", data);
            return data;

        } catch (error) {
            console.error("Error fetching departments:", error.message);
            return null;
        }
    }

    
    static async GetDepartmentID(Name) {
        const departments = await this.GetDepartments();
        const dept = departments.find(d => d.Name === Name);
        return dept ? dept.DepartmentID : null;
    }

    static async GetDepartmentName(id) {
        const departments = await this.GetDepartments();
        const dept = departments.find(d => d.DepartmentID === parseInt(id));
        return dept ? dept.Name : null;
    }

    static async deleteBooking(bookingID) {
        try {
            let user = await this.getUserData();
            
            const { data, error } = await supabase.rpc('delete_my_booking', {
                p_booking_id: bookingID
            });
            
            if (error) throw error;
            if (!data.success) {
                console.error('Delete rejected:', data.error);
                return;
            }

            const roomID = data.room_id;

            if (user && roomID) {
                await this.invalidateBookingCaches(user.id, roomID);
            }

        } catch (error) {
            console.error('Deleting booking error:', error.message);
        }
    }

    static async requestPasswordReset(email) {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) {
                console.error('Reset request error:', error.message);
                // Intentionally do not expose errors to prevent user enumeration
            }

            return { 
                success: true, 
                message: "If an account exists, a recovery link has been sent to that email." 
            };

        } catch (error) {
            console.error('System error:', error.message);
            return { success: false, message: "An unexpected error occurred." };
        }
    }

    // PHASE 2: Save the new password (called after user clicks email link)
    static async updatePassword(newPassword) {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;
            await supabase.auth.signOut();
            
            return { success: true };

        } catch (error) {
            console.error('Password update error:', error.message);
            return { success: false, error: error.message };
        }
    }
    
}