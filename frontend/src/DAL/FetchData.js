import { data } from 'autoprefixer';
import { supabase } from '../supabaseClient';
import { cacheGet, cacheSet, cacheDelete } from '../lib/cache.js'; 

export default class FetchDAL {

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
        const { data, error } = await supabase
            .from('User')
            .select(`*`);

        if (error) throw error;
        console.log('All Users', data)
        return data;
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
        let user = await this.getUserData();
        let uid = user.id
        console.log('ID -', uid);
        const { data, error } = await supabase
            .from('User')
            .select('*')
            .eq('UserID', uid)
            .single()

        if (error) {
            throw error
        } else {
            console.log('SUCCESS: USER', data);
        }

        return data
    }

    static async loggedInOrgID()
    {
        let currentUser = await this.getCurrentUser()
        let result = currentUser.OrganisationID;
        result = parseInt(result)
        console.log('Returned user', currentUser)
        console.log('RESUT', result)
        return result
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
            const [startTime, endTime] = duration.split(" - ");
            const dateBooked = new Date().toISOString().split('T')[0];
            
            // Fire the single payload to the database
            const { data, error } = await supabase.rpc('create_bookings_batch', {
                p_room_id: parseInt(roomID),
                p_user_id: user.id,
                p_booking_dates: datesArray,
                p_start_time: startTime + ':00',
                p_end_time: endTime + ':00',
                p_title: title,
                p_description: description,
                p_created_time: dateBooked
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
        console.log(bookingID, title, description);
        try {
            let user = await this.getUserData();
            
            const { error } = await supabase
                .from('Booking')
                .update({ 'Title': title, 'Description': description })
                .eq('BookingID', bookingID);
            
            if (error) {
                console.log(error.message);
                return;
            }

            if (user) {
                await this.invalidateBookingCaches(user.id);
            }

        } catch (error) {
            console.log(error.message);
        }
    }
    static async fetchUserBookings(userId) {
        const cacheKey = `bookings:user:${userId}`;
        const cachedBookings = await cacheGet(cacheKey);
        
        if (cachedBookings) return cachedBookings;

        const { data, error } = await supabase
            .from('Booking')
            .select(`*, Room ( RoomName, Capacity )`)
            .eq('UserID', userId)
            .order('BookingDate', { ascending: false });

        if (error) throw error;
        
        await cacheSet(cacheKey, data, 300); 
        return data;
    }

    static async fetchBookings(bookingDate) {
        try {
            const { data, error } = await supabase
                .from('Booking')
                .select(`
                *,
                User (
                    Firstname,
                    Surname,
                    UserEmail
                )
            `)
                .eq('BookingDate', bookingDate);

            console.log('Bookings', data)
            return data

        }
        catch (error) {
            console.log(error.message)
        }
    }

    static async fetchBookingsWeek(roomID, startDate, endDate) {
        try {
            const { data, error } = await supabase
                .from('Booking')
                .select(`
                *,
                User (
                    Firstname,
                    Surname,
                    UserEmail
                )
            `)
                .eq('RoomID', roomID)
                .gte('BookingDate', startDate)
                .lte('BookingDate', endDate);

            console.log('Bookings for the week for room ID', roomID, '      ', data)
            return data

        }
        catch (error) {
            console.log(error.message)
        }
    }

    static async fetchAllBookings() {
        try {
            const { data, error } = await supabase
                .from('Booking')
                .select(`
                *`
                )

            console.log('Bookings', data)
            return data
        }
        catch (error) {
            console.log(error.message)
        }
    }

    static async GetSchools() {
        const cacheKey = 'orgs:schools:active';
        
        // 1. Check Cache
        const cachedSchools = await cacheGet(cacheKey);
        if (cachedSchools) {
            console.log('SUCCESS (Cache): Schools');
            return cachedSchools;
        }

        // 2. Fetch from Supabase on cache miss
        console.log("--- Executing Supabase fetch ---");
        const { data, error } = await supabase
            .from('Organisation')
            .select('OrganisationID,Name,StartTime,FinishTime,IntervalDuration,IntervalName,LunchStart, LunchEnd, BreakStart, BreakEnd')
            .eq('LisenceStatus', true)

        if (error) throw error;
        
        // 3. Set Cache (e.g., cache for 1 hour / 3600 seconds)
        await cacheSet(cacheKey, data, 3600);
        console.log('SUCCESS (DB):', data);
        
        return data;
    }

    static async getRooms() {
        console.log('Getting Rooms');
        let userConfirmed = await this.getCurrentUser();
        let orgID = userConfirmed.OrganisationID;
        
        if (!userConfirmed.Confirmed) return null;

        const cacheKey = `rooms:org:${orgID}`;
        
        // 1. Check Cache
        const cachedRooms = await cacheGet(cacheKey);
        if (cachedRooms) return cachedRooms;

        // 2. Fetch from Supabase
        const { data, error } = await supabase
            .from('Room')
            .select('*')
            .eq('IsAvailable', true)
            .eq('OrganisationID', orgID);

        if (error) {
            console.log(error.message, error.code);
            return null;
        }

        // 3. Set Cache
        await cacheSet(cacheKey, data, 3600);
        return data;
    }

    static async AddNewRoom(title, location, capacity, features) {
        try {
            let capacityFormatted = parseInt(capacity);
            let orgID = await this.loggedInOrgID();
            orgID = parseInt(orgID);
            
            const { error } = await supabase
                .from('Room')
                .insert({ 
                    RoomName: title, 
                    Capacity: capacityFormatted, 
                    IsAvailable: true, 
                    Location: location, 
                    Features: features, 
                    OrganisationID: orgID 
                });
                
            if (error) throw error;

            // INVALIDATE: The room list for this org has changed
            await cacheDelete(`rooms:org:${orgID}`);
            
        } catch (error) {
            console.log(error.message);
        }
    }

    static async deleteRoom(roomID) {
        let id = parseInt(roomID);
        // We need the orgID to invalidate the cache. You might need to fetch the room first 
        // to know which org it belongs to, or clear a global room cache if you change your key structure.
        let orgID = await this.loggedInOrgID(); 

        const { error } = await supabase
            .from('Room')
            .delete()
            .eq('RoomID', id);
            
        if (error) {
            console.log(error.message, error.code);
        } else {
            // INVALIDATE
            await cacheDelete(`rooms:org:${orgID}`);
        }
    }

    static async UpdateRooms(id, roomName, location, capacity, features) {
        console.log('Saving room changes', id, roomName, location, capacity, features)

        const { error } = await supabase
            .from('Room')
            .update({ 'RoomName': roomName, 'Location': location, 'Capacity': parseInt(capacity), 'Features': features })
            .eq('RoomID', parseInt(id))
        if (error) {
            console.log(error.message, error.code)
        } else {
            console.log('SUCCESS:', data);
        }

        return data
    }

    static async GetOrganisationID(Name) {
        console.log("--- Executing Dept fetch ---");
        const { data, error } = await supabase
            .from('Organisation')
            .select('OrganisationID')
            .eq('Name', Name)
            .single()

        if (error) {
            throw error
        }
        console.log('IMPORTANT:', data);

        return data.OrganisationID
    }

    static async GetDepartments(organisationID) {
        const { data, error } = await supabase
            .from('Department')
            .select('DepartmentID,Name')
            .eq('OrganisationID', organisationID); 

        if (error) {
            console.log(error);
            throw error;
        } else {
            console.log("Fetched Departments for Org ID:", organisationID);
        }

        return data;
    }

    static async GetDepartmentID(Name) {
        console.log("--- Executing DeptID fetch ---");
        const { data, error } = await supabase
            .from('Department')
            .select('DepartmentID')
            .eq('Name', Name)
            .single()

        if (error) {
            console.log(error)
            throw error
        } else {
            console.log('Name', Name);
        }

        return data.DepartmentID
    }

    static async GetDepartmentName(id) {
        const { data, error } = await supabase
            .from('Department')
            .select('Name')
            .eq('DepartmentID', parseInt(id))
            .single()

        if (error) {
            console.log(error)
            throw error
        }
    }

    static async deleteBooking(bookingID) {
        try {
            let id = parseInt(bookingID);
            console.log(bookingID);
            let user = await this.getUserData();
            
            // Optional: Fetch the booking first so we know which room cache to clear
            const { data: bookingToDel } = await supabase
                .from('Booking')
                .select('RoomID')
                .eq('BookingID', id)
                .single();
                
            const roomID = bookingToDel ? bookingToDel.RoomID : null;

            const { error } = await supabase
                .from('Booking')
                .delete()
                .eq('BookingID', id);
            
            if (error) {
                console.log('deleting user error-', error.message);
                return;
            }

            // INVALIDATE CACHE
            if (user) {
                await this.invalidateBookingCaches(user.id, roomID);
            }

        } catch (error) {
            console.log('deleting booking error-', error.message);
        }
    }
}