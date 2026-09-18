import { supabase } from '../supabaseClient';
import { cacheGet, cacheSet, cacheDelete } from '../lib/cache.js'; 
import {
    validateBookingTitle,
    validateBookingDescription,
    validateRecurrenceLength,
    validateRecurrenceFrequency,
    validateRoomName,
    validateRoomLocation,
    validateRoomCapacity,
    validateRoomFeatures,
    validateCategoryName,
    validateEmail,
    validatePassword,
    validateDate,
    validateDateRange,
    validateTimeDuration,
    validateId,
    validateUuid,
} from '../lib/validation.js';

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
        const catVal = validateCategoryName(categoryName);
        if (!catVal.isValid) {
            console.error('Validation Error (addCategory):', catVal.error);
            return { success: false, error: catVal.error };
        }
        console.log('Adding new category via RPC:', categoryName);
        try {
            const { data: newId, error } = await supabase.rpc('add_category', { 
                p_name: categoryName.trim() 
            });
            
            if (error) throw error;
            return { success: true, id: newId };
            
        } catch (error) {
            console.error('Add Category Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async editCategory(categoryId, categoryName) {
        const idVal = validateUuid(categoryId, 'Category ID');
        if (!idVal.isValid) {
            console.error('Validation Error (editCategory):', idVal.error);
            return { success: false, error: idVal.error };
        }
        const catVal = validateCategoryName(categoryName);
        if (!catVal.isValid) {
            console.error('Validation Error (editCategory):', catVal.error);
            return { success: false, error: catVal.error };
        }
        console.log('Updating category via RPC:', categoryId);
        try {
            const { data: success, error } = await supabase.rpc('edit_category', { 
                p_id: idVal.value, 
                p_name: categoryName.trim() 
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
        const idVal = validateUuid(categoryId, 'Category ID');
        if (!idVal.isValid) {
            console.error('Validation Error (deleteCategory):', idVal.error);
            return { success: false, error: idVal.error };
        }
        console.log('Deleting category via RPC:', categoryId);
        try {
            const { data: success, error } = await supabase.rpc('delete_category', { 
                p_id: idVal.value 
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
        const userVal = validateUuid(userID, 'User ID');
        if (!userVal.isValid) {
            console.error('Validation Error (makeAdmin):', userVal.error);
            throw new Error(userVal.error);
        }
        try {
            const response = await supabase.functions.invoke('update-user-role', {
                body: { target_user_id: userID, new_role: 'admin' }
            });
            
            if (response.error) {
                // Supabase puts custom edge function errors here. Let's extract your exact message.
                const errBody = await response.error.context?.json?.().catch(() => null);
                throw new Error(errBody?.error || response.error.message || "Failed to assign admin role.");
            }
            return { success: true };
            
        } catch (error) {
            console.error('Error making admin:', error);
            throw error; // MUST throw this so the frontend can catch it!
        }
    }

    static async removeAdmin(userID) {
        const userVal = validateUuid(userID, 'User ID');
        if (!userVal.isValid) {
            console.error('Validation Error (removeAdmin):', userVal.error);
            throw new Error(userVal.error);
        }
        try {
            const response = await supabase.functions.invoke('update-user-role', {
                body: { target_user_id: userID, new_role: 'standard' }
            });
            
            if (response.error) {
                const errBody = await response.error.context?.json?.().catch(() => null);
                throw new Error(errBody?.error || response.error.message || "Failed to remove admin role.");
            }
            return { success: true };
            
        } catch (error) {
            console.error('Error removing admin:', error);
            throw error; // MUST throw this so the frontend can catch it!
        }
    }

    static async approveUser(userID){
        const userVal = validateUuid(userID, 'User ID');
        if (!userVal.isValid) {
            console.error('Validation Error (approveUser):', userVal.error);
            throw new Error(userVal.error);
        }
        console.log('Approving user via RPC');
        try {
            const { error } = await supabase.rpc('approve_user', {
                target_user_id: userID
            });
            if (error) throw error;
            return { success: true };
        }
        catch (error) {
            console.log(error.message);
            throw error;
        }
    }

    static async deleteUser(userID) {
        const userVal = validateUuid(userID, 'User ID');
        if (!userVal.isValid) {
            console.error('Validation Error (deleteUser):', userVal.error);
            throw new Error(userVal.error);
        }
        console.log('Deleting user via Edge Function:', userID);
        const { data, error } = await supabase.functions.invoke('delete-user', {
            body: { userId: userID }
        });
        if (error) {
            const errBody = await error.context?.json?.().catch(() => null);
            throw new Error(errBody?.error || error.message || "Failed to delete user.");
        }
        return data;
    }

    static async checkWeekendDate(checkDate){
        if (this.isWeekend(checkDate)) {
            let jump = (checkDate.getDay() === 6) ? 2 : 1;
            checkDate.setDate(checkDate.getDate() + jump);
        }
        return checkDate
    }

    static async executeSecureBooking(roomID, datesArray, duration, title, description) {
        const roomVal = validateId(roomID, 'Room ID');
        if (!roomVal.isValid) return { isValid: false, error: roomVal.error };

        if (!Array.isArray(datesArray) || datesArray.length === 0) {
            return { isValid: false, error: "At least one booking date is required." };
        }
        for (const d of datesArray) {
            const dVal = validateDate(d, 'Booking date');
            if (!dVal.isValid) return { isValid: false, error: dVal.error };
        }

        const durVal = validateTimeDuration(duration);
        if (!durVal.isValid) return { isValid: false, error: durVal.error };

        const titleVal = validateBookingTitle(title);
        if (!titleVal.isValid) return { isValid: false, error: titleVal.error };

        const descVal = validateBookingDescription(description);
        if (!descVal.isValid) return { isValid: false, error: descVal.error };

        try {
            const user = await this.getUserData();
            if (!user) {
                return { isValid: false, error: "Not authenticated." };
            }

            const [startTime, endTime] = duration.split(" - ");

            const { data, error } = await supabase.rpc('create_bookings_batch', {
                p_room_id: parseInt(roomID, 10),
                p_booking_dates: datesArray,
                p_start_time: startTime + ':00',
                p_end_time: endTime + ':00',
                p_title: title.trim(),
                p_description: description ? description.trim() : ''
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
        const dateVal = validateDate(startBookingDate, 'Start date');
        if (!dateVal.isValid) return { isValid: false, error: dateVal.error };

        const recVal = validateRecurrenceLength(recurrenceLength);
        if (!recVal.isValid) return { isValid: false, error: recVal.error };

        const parsedLength = parseInt(recurrenceLength, 10);
        let checkDate = new Date(startBookingDate);
        let datesToBook = [];

        while (datesToBook.length < parsedLength) {
            if (this.isWeekend(checkDate)) {
                let jump = (checkDate.getDay() === 6) ? 2 : 1;
                checkDate.setDate(checkDate.getDate() + jump);
            }
            datesToBook.push(checkDate.toISOString().split('T')[0]);
            checkDate.setDate(checkDate.getDate() + 1);
        }

        return await this.executeSecureBooking(roomID, datesToBook, duration, title, description);
    }

    static async createBooking(description, roomID, bookingDate, duration, title) {
        const dateVal = validateDate(bookingDate, 'Booking date');
        if (!dateVal.isValid) return { isValid: false, error: dateVal.error };

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
        const userVal = validateUuid(userId, 'User ID');
        if (!userVal.isValid) {
            console.error('Validation Error (getUserPublicInfo):', userVal.error);
            return null;
        }

        try {
            const { data, error } = await supabase
                .rpc('get_user_public_info', { p_user_id: userId })
                .single();

            if (error) throw error;
            if (!data) return null;

            return {
                Firstname: data.Firstname || data.firstname || data.first_name || '',
                Surname: data.Surname || data.surname || data.last_name || '',
                UserEmail: data.UserEmail || data.useremail || data.email || ''
            };

        } catch (error) {
            console.error('User lookup failed:', error.message);
            return null;
        }
    }

    static async createMonthlyRecurringBooking(description, roomID, bookingDate, duration, title, frequency, recurrenceLength, monthlyOrdinal, monthlyWeekday, monthlyType, skipweekend) {
        const dateVal = validateDate(bookingDate, 'Booking date');
        if (!dateVal.isValid) return { isValid: false, error: dateVal.error };

        const freqVal = validateRecurrenceFrequency(frequency);
        if (!freqVal.isValid) return { isValid: false, error: freqVal.error };

        const recVal = validateRecurrenceLength(recurrenceLength);
        if (!recVal.isValid) return { isValid: false, error: recVal.error };

        const parsedLength = parseInt(recurrenceLength, 10);
        const rawType = String(monthlyType || '').toLowerCase();
        const mType = (rawType === 'date' || rawType === 'fixed') ? 'fixed' : rawType;
        if (mType !== 'fixed' && mType !== 'ordinal') {
            return { isValid: false, error: "Monthly recurrence type must be 'fixed' or 'ordinal'." };
        }

        let datesToBook = [];

        if (mType === 'fixed') {
            let tempDate = new Date(bookingDate);
            const originalDay = tempDate.getDate(); 

            for (let i = 0; i < parsedLength; i++) {
                datesToBook.push(tempDate.toISOString().split('T')[0]);
                tempDate.setMonth(tempDate.getMonth() + 1);
                
                if (tempDate.getDate() !== originalDay) {
                    tempDate.setDate(0); 
                }
            }
        } 
        else if (mType === 'ordinal') {
            const ordNum = parseInt(monthlyOrdinal, 10);
            if (isNaN(ordNum) || ordNum < 1 || ordNum > 5) {
                return { isValid: false, error: "Monthly ordinal must be between 1 and 5." };
            }
            const dayNum = parseInt(monthlyWeekday, 10);
            if (isNaN(dayNum) || dayNum < 0 || dayNum > 6) {
                return { isValid: false, error: "Monthly weekday must be between 0 (Sunday) and 6 (Saturday)." };
            }
            let bookingDates = await this.createOrdinalDates(bookingDate, dayNum, ordNum, parsedLength, skipweekend);
            if (!bookingDates) {
                return { isValid: false, error: "Could not calculate recurring dates." };
            }
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
                    if (searchDate.getDay() === parseInt(targetDay, 10)) {
                        if (!skipweekend) {
                            occurrenceCounter++;
                            if (occurrenceCounter === parseInt(targetOrdinal, 10)) {
                                results.push(new Date(searchDate));
                                foundForThisMonth = true;
                                break; 
                            }
                        }
                        else {
                            let updatedDate = new Date(searchDate);
                            if (this.isWeekend(updatedDate)) {
                                let jump = (updatedDate.getDay() === 6) ? 2 : 1;
                                updatedDate.setDate(updatedDate.getDate() + jump);
                            }
                            occurrenceCounter++;
                            if (occurrenceCounter === parseInt(targetOrdinal, 10)) {
                                results.push(updatedDate);
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
            console.log(error.message);
            return false;
        }
    }
    static async createWeeklyBooking(description, roomID, bookingDate, duration, title, recurrenceLength) {
        const dateVal = validateDate(bookingDate, 'Booking date');
        if (!dateVal.isValid) return { isValid: false, error: dateVal.error };

        const recVal = validateRecurrenceLength(recurrenceLength);
        if (!recVal.isValid) return { isValid: false, error: recVal.error };

        const parsedLength = parseInt(recurrenceLength, 10);
        let spacing = 7;
        let datesToBook = [];
        
        for (let index = 0; index < parsedLength; index++) {
            let date = new Date(bookingDate);
            date.setDate(date.getDate() + (spacing * index));
            datesToBook.push(date.toISOString().split('T')[0]);
        }

        return await this.executeSecureBooking(roomID, datesToBook, duration, title, description);
    }

    static async createRecurringBooking(description, roomID, bookingDate, duration, title, frequency, recurrenceLength, skipweekend) {
        const freqVal = validateRecurrenceFrequency(frequency);
        if (!freqVal.isValid) return { isValid: false, error: freqVal.error };

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
        const idVal = validateId(bookingID, 'Booking ID');
        if (!idVal.isValid) {
            console.error('Validation Error (updateBooking):', idVal.error);
            return { success: false, error: idVal.error };
        }
        const titleVal = validateBookingTitle(title);
        if (!titleVal.isValid) {
            console.error('Validation Error (updateBooking):', titleVal.error);
            return { success: false, error: titleVal.error };
        }
        const descVal = validateBookingDescription(description);
        if (!descVal.isValid) {
            console.error('Validation Error (updateBooking):', descVal.error);
            return { success: false, error: descVal.error };
        }

        try {
            const { data: success, error } = await supabase
                .rpc('update_my_booking', {
                    p_booking_id: parseInt(bookingID, 10),
                    p_title: title.trim(),
                    p_description: description ? description.trim() : ''
                });
            
            if (error) {
                console.error('Database error:', error.message);
                return { success: false, error: error.message };
            }

            if (!success) {
                console.warn('Update failed: Booking not found or permission denied.');
                return { success: false, error: 'Update failed: Booking not found or permission denied.' };
            }

            let user = await this.getUserData();
            if (user) {
                await this.invalidateBookingCaches(user.id);
            }
            return { success: true };

        } catch (error) {
            console.error('Caught error:', error.message);
            return { success: false, error: error.message };
        }
    }
    static async fetchUserBookings(userId) {
        const userVal = validateUuid(userId, 'User ID');
        if (!userVal.isValid) {
            console.error('Validation Error (fetchUserBookings):', userVal.error);
            return [];
        }

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
        const dateVal = validateDate(bookingDate, 'Booking date');
        if (!dateVal.isValid) {
            console.error('Validation Error (fetchBookings):', dateVal.error);
            return [];
        }

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
            return [];
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
        const idVal = validateId(roomID, 'Room ID');
        if (!idVal.isValid) {
            console.error('Validation Error (fetchBookingsWeek):', idVal.error);
            return [];
        }
        const rangeVal = validateDateRange(startDate, endDate);
        if (!rangeVal.isValid) {
            console.error('Validation Error (fetchBookingsWeek):', rangeVal.error);
            return [];
        }

        try {
            const { data, error } = await supabase.rpc('get_org_bookings_by_room', {
                p_room_id: parseInt(roomID, 10),
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
            return [];
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
        const nameVal = validateRoomName(title);
        if (!nameVal.isValid) return { success: false, error: nameVal.error };

        const locVal = validateRoomLocation(location);
        if (!locVal.isValid) return { success: false, error: locVal.error };

        const capVal = validateRoomCapacity(capacity);
        if (!capVal.isValid) return { success: false, error: capVal.error };

        const featVal = validateRoomFeatures(features);
        if (!featVal.isValid) return { success: false, error: featVal.error };

        let cleanCatIds = null;
        if (categoryIds !== null && categoryIds !== undefined) {
            if (!Array.isArray(categoryIds)) {
                return { success: false, error: "Category IDs must be an array." };
            }
            cleanCatIds = [];
            for (const catId of categoryIds) {
                const cVal = validateUuid(catId, 'Category ID');
                if (!cVal.isValid) return { success: false, error: cVal.error };
                cleanCatIds.push(cVal.value);
            }
        }

        try {
            const { error } = await supabase.rpc('insert_room_admin', {
                p_room_name: title.trim(),
                p_location: location.trim(),
                p_capacity: parseInt(capacity, 10),
                p_features: features ? features.trim() : '',
                p_category_ids: cleanCatIds 
            });
                
            // If Supabase throws an error, catch it
            if (error) {
                console.error("Supabase RPC Error:", error);
                throw error;
            }

            // If no error, the room was added successfully!
            let orgID = await this.loggedInOrgID();
            
            // Only run cacheDelete if you actually have it imported!
            if (typeof cacheDelete === 'function' && orgID) {
                await cacheDelete(`rooms:org:${orgID}`);
            }
            
            return { success: true };
            
        } catch (error) {
            console.error('Add Room Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async UpdateRooms(id, roomName, location, capacity, features, categoryIds) {
        const idVal = validateId(id, 'Room ID');
        if (!idVal.isValid) {
            console.error('Validation Error (UpdateRooms):', idVal.error);
            return { success: false, error: idVal.error };
        }
        const nameVal = validateRoomName(roomName);
        if (!nameVal.isValid) return { success: false, error: nameVal.error };

        const locVal = validateRoomLocation(location);
        if (!locVal.isValid) return { success: false, error: locVal.error };

        const capVal = validateRoomCapacity(capacity);
        if (!capVal.isValid) return { success: false, error: capVal.error };

        const featVal = validateRoomFeatures(features);
        if (!featVal.isValid) return { success: false, error: featVal.error };

        let cleanCatIds = null;
        if (categoryIds !== null && categoryIds !== undefined) {
            if (!Array.isArray(categoryIds)) {
                return { success: false, error: "Category IDs must be an array." };
            }
            cleanCatIds = [];
            for (const catId of categoryIds) {
                const cVal = validateUuid(catId, 'Category ID');
                if (!cVal.isValid) return { success: false, error: cVal.error };
                cleanCatIds.push(cVal.value);
            }
        }

        console.log('Saving room changes', id, roomName);
        try {
            const { data: success, error } = await supabase.rpc('update_room_admin', {
                p_room_id: parseInt(id, 10),
                p_room_name: roomName.trim(),
                p_location: location.trim(),
                p_capacity: parseInt(capacity, 10),
                p_features: features ? features.trim() : '',
                p_category_ids: cleanCatIds 
            });

            if (error) throw error;
            if (!success) {
                console.warn('Update rejected: Insufficient permissions or room not found.');
                return { success: false, error: 'Update rejected: Room not found or permission denied.' };
            }

            let orgID = await this.loggedInOrgID();
            if (orgID) {
                await cacheDelete(`rooms:org:${orgID}`);
            }
            return { success: true };
            
        } catch (error) {
            console.error('Update Room Error:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async deleteRoom(roomID) {
        const idVal = validateId(roomID, 'Room ID');
        if (!idVal.isValid) {
            console.error('Validation Error (deleteRoom):', idVal.error);
            return { success: false, error: idVal.error };
        }
        try {
            const { data: success, error } = await supabase.rpc('delete_room_admin', {
                p_room_id: parseInt(roomID, 10)
            });
            
            if (error) throw error;
            if (!success) {
                console.warn('Delete rejected: Insufficient permissions or room not found.');
                return { success: false, error: 'Insufficient permissions or room not found.' };
            }

            let orgID = await this.loggedInOrgID();
            if (orgID) {
                await cacheDelete(`rooms:org:${orgID}`);
            }
            return { success: true };
            
        } catch (error) {
            console.error('Delete Room Error:', error.message);
            return { success: false, error: error.message };
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
        const dept = departments.find(d => d.DepartmentID === parseInt(id, 10));
        return dept ? dept.Name : null;
    }

    static async deleteBooking(bookingID) {
        const idVal = validateUuid(bookingID, 'Booking ID');
        if (!idVal.isValid) {
            console.error('Validation Error (deleteBooking):', idVal.error);
            return { success: false, error: idVal.error };
        }
        try {
            let user = await this.getUserData();
            
            const { data, error } = await supabase.rpc('delete_my_booking', {
                p_booking_id: idVal.value
            });
            
            if (error) throw error;
            if (!data.success) {
                console.error('Delete rejected:', data.error);
                return { success: false, error: data.error };
            }

            const roomID = data.room_id;

            if (user && roomID) {
                await this.invalidateBookingCaches(user.id, roomID);
            }
            return { success: true };

        } catch (error) {
            console.error('Deleting booking error:', error.message);
            return { success: false, error: error.message };
        }
    }

    static async requestPasswordReset(email) {
        const emailVal = validateEmail(email);
        if (!emailVal.isValid) {
            return { success: false, message: emailVal.error };
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
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
        const passVal = validatePassword(newPassword);
        if (!passVal.isValid) {
            return { success: false, error: passVal.error };
        }
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