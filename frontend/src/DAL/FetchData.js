import { data } from 'autoprefixer';
import { supabase } from '../supabaseClient';
import { cacheGet, cacheSet, cacheDelete } from '../lib/cache.js'; 

export default class FetchDAL {

    static async invalidateBookingCaches(userID, roomID = null) {
        // Core keys that always need clearing
        const keysToDelete = [
            `bookings:user:${userID}`,
            'bookings:all' 
        ];
        
        // If a roomID is provided, clear room-specific caches too
        if (roomID) {
            keysToDelete.push(`bookings:room:${roomID}`);
        }

        console.log('Invalidating booking caches:', keysToDelete);
        
        // Execute deletions concurrently for better performance
        await Promise.all(keysToDelete.map(key => cacheDelete(key)));
    }

    static async AddUser(userID,email, firstname, surname, OrganisationID, departmentID) {
        try {
            const role = 'standard'
            const { error: dbError } = await supabase
                .from('User')
                .insert([{
                    UserID: userID,
                    UserEmail: email,
                    Firstname: firstname,
                    Surname: surname,
                    Role: role,
                    DepartmentID: departmentID,
                    OrganisationID: OrganisationID,
                    Confirmed: false
                }]);

            if (dbError) throw dbError;

        }
        catch (error) {
            console.log('user creation error', error)

            console.error('User creation flow interrupted:', error.message);
        }
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
        console.log('UserID to be admin', userID)
        try {
            const { error } = await supabase
                .from('User')
                .update({ 'Role': 'admin' })
                .eq('UserID', userID)
        }
        catch (error) {
            console.log(error.message)
        }

    }
    static async removeAdmin(userID) {
        console.log('UserID to have admin revoked', userID)
        try {
            const { error } = await supabase
                .from('User')
                .update({ 'Role': 'standard' })
                .eq('UserID', userID)
        }
        catch (error) {
            console.log(error.message)
        }

    }
    static async approveUser(userID){
        console.log('Approving user')
        try {
            const { error } = await supabase
                .from('User')
                .update({ 'Confirmed': true })
                .eq('UserID', userID)
        }
        catch (error) {
            console.log(error.message)
        }

    }

    s
    static async ApproveRequest(userID) {
        console.log('UserID to be approved', userID)
        try {
            const { error } = await supabase
                .from('User')
                .update({ 'Role': 'standard' })
                .eq('UserID', userID)
        }
        catch (error) {
            console.log(error.message)
        }
    }

    static async DenyRequest(userID) {
        console.log('UserID to be denied', userID)
        try {
            const { error } = await supabase
                .from('User')
                .update({ 'Role': 'standard' })
                .eq('UserID', userID)
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
    static async createDailyBooking(userID, description, roomID, startBookingDate, duration, title, recurrenceLength, dateBooked) {
        const timings = duration.split(" - ");
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

        const { data, error: checkError } = await supabase
            .from('Booking')
            .select('BookingDate')
            .eq('RoomID', parseInt(roomID))
            .eq('BookingStartTime', timings[0] + ':00')
            .in('BookingDate', datesToBook); 

        if (checkError) return false;
        if (data && data.length > 0) {
            console.log("Conflicts found on:", data);
            errorMessage = 'Conflicts found on: ${data}';
            return { isValid: false, error: errorMessage };
        }


        const rowsToInsert = datesToBook.map(dateStr => ({
            Description: description,
            RoomID: roomID,
            UserID: userID,
            BookingDate: dateStr,
            BookingStartTime: timings[0],
            BookingEndTime: timings[1],
            CreatedTimeStamp: dateBooked,
            Title: title
        }));

        const { error: insertError } = await supabase
            .from('Booking')
            .insert(rowsToInsert);

        if (insertError) {
            console.error("Bulk insert failed:", insertError);
            return false;
        }

        return true;
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
        const timings = duration.split(" - ");
        let date = new Date(bookingDate);
        let user = await this.getUserData();
        let userID = user.id;
        const dateBooked = new Date().toISOString().split('T')[0];

        if (monthlyType.toLowerCase() === 'fixed') {

            let datesToBook = [];
            let tempDate = new Date(bookingDate);
            const originalDay = tempDate.getDate(); // Store the day (e.g., 15)

            for (let i = 0; i < recurrenceLength; i++) {
                datesToBook.push(tempDate.toISOString().split('T')[0]);
                tempDate.setMonth(tempDate.getMonth() + 1);
                if (tempDate.getDate() !== originalDay) {
                    tempDate.setDate(0); 
                }
            }

            console.log('DATES for fixed:', datesToBook)

            const { data, error } = await supabase
                .from('Booking')
                .select('BookingDate')
                .eq('RoomID', parseInt(roomID))
                .eq('BookingStartTime', timings[0] + ':00')
                .in('BookingDate', datesToBook); 

            if (error) return false;
            if (data && data.length > 0) {
                console.log("Conflicts found on:", data);
                return false;
            }

            for (let index = 0; index < recurrenceLength; index++) {
                const { error } = await supabase
                    .from('Booking')
                    .insert({
                        Description: description,
                        RoomID: roomID,
                        UserID: userID,
                        BookingDate: date.toISOString().split('T')[0],
                        BookingStartTime: timings[0],
                        BookingEndTime: timings[1],
                        CreatedTimeStamp: dateBooked,
                        Title: title
                    });

                if (error) {
                    console.log(error.message)
                    return false
                }
                console.log(date);
                date.setMonth(date.getMonth() + 1);
            }
            return true
        }
        else if (monthlyType.toLowerCase() === 'ordinal') {
            let bookingDates = await this.createOrdinalDates(bookingDate, monthlyWeekday, monthlyOrdinal, recurrenceLength, skipweekend);
            let dateStrings = this.formatDates(bookingDates); 
            
           const { data: conflicts, error: checkError } = await supabase
                .from('Booking')
                .select('BookingDate')
                .eq('RoomID', parseInt(roomID))
                .eq('BookingStartTime', timings[0] + ':00')
                .in('BookingDate', dateStrings);

            if (checkError){
                console.log(error.message)
                return false   
            };
            
            if (conflicts && conflicts.length > 0) {
                console.log("Conflicts found on these dates:", conflicts);
                return false; 
            }

            const rowsToInsert = dateStrings.map(dateStrings => ({
                Description: description,
                RoomID: roomID,
                UserID: userID,
                BookingDate: dateStrings,
                BookingStartTime: timings[0],
                BookingEndTime: timings[1],
                CreatedTimeStamp: dateBooked,
                Title: title
            }));

            const { error: insertError } = await supabase
                .from('Booking')
                .insert(rowsToInsert); 

            if (insertError) {
                console.error("Bulk insert failed:", insertError.message);
                return false;
            }

            return true; 
        }
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
    static async createWeeklyBooking(userID, description, roomID, bookingDate, duration, title, recurrenceLength, dateBooked){
        let spacing = 7;
        console.log('Processing Weekly');
        try{
            const timings = duration.split(" - ");
            let currentBookings = await this.fetchAllBookings();
            let spaceFree = true;

            console.log("--- Executing booking Insert for recurrence ---");
            for (let index = 0; index < recurrenceLength; index++) {
                let date = new Date(bookingDate);
                date.setDate(date.getDate() + (spacing * index));

                for (let i = 0; i < (currentBookings).length; i++) {
                    let currentDate = currentBookings[i].BookingDate
                    let newbookingDate = date.toISOString().split('T')[0]
                    let RoomID = parseInt(currentBookings[i].RoomID)
                    roomID = parseInt(roomID)
                    let currentTime = currentBookings[i].BookingStartTime.substring(0, 5);
                    if (currentDate === newbookingDate && RoomID === roomID && currentTime === timings[0]) {
                        console.log("Slot has been booked on", newbookingDate)
                        spaceFree = false;
                        break;
                    }
                }
                if (!spaceFree){
                    return false;
                } 


            }
            if (spaceFree) {
                for (let index = 0; index < recurrenceLength; index++) {
                    let date = new Date(bookingDate);
                    date.setDate(date.getDate() + (spacing * index));
                    const { error } = await supabase
                        .from('Booking')
                        .insert({
                            Description: description,
                            RoomID: roomID,
                            UserID: userID,
                            BookingDate: date.toISOString().split('T')[0],
                            BookingStartTime: timings[0],
                            BookingEndTime: timings[1],
                            CreatedTimeStamp: dateBooked,
                            Title: title
                        });

                    if (error){
                        console.log(error.message)
                        return false;
                    } 
                }
                return true;
            }
            console.log(await this.fetchUserBookings());
            return false;
        }
        catch(error){
            console.log(error.message)
        }       
    }

    static async createRecurringBooking(description, roomID, bookingDate, duration, title, frequency, recurrenceLength, skipweekend) {
        try {
            let bookingCreated = true;
            let user = await this.getUserData();
            let userID = user.id;
            const dateBooked = new Date().toISOString().split('T')[0];
            const freq = frequency.toLowerCase();

            if (freq === 'daily') {
                console.log('Processing Daily');
                bookingCreated = await this.createDailyBooking(userID, description, roomID, bookingDate, duration, title, recurrenceLength, dateBooked, skipweekend);
            }
            else if (freq === 'weekly') {
                bookingCreated = await this.createWeeklyBooking(userID, description, roomID, bookingDate, duration, title, recurrenceLength, dateBooked, skipweekend);
            }

            // INVALIDATE CACHE if successful
            if (bookingCreated) {
                await this.invalidateBookingCaches(userID, roomID);
            }

            return bookingCreated;

        } catch (error) {
            console.error("Recurrence Error:", error.message);
        }
    }

    static async createBooking(description, roomID, bookingDate, duration, title) {
        try {
            let user = await this.getUserData();
            let userID = user.id;
            const date = new Date();
            const dateBooked = date.toISOString().split('T')[0];
            const timings = duration.split(" - ");
            
            console.log("--- Executing booking Insert ---");
            const { error } = await supabase
                .from('Booking')
                .insert({
                    Description: description,
                    RoomID: roomID,
                    UserID: userID,
                    BookingDate: bookingDate,
                    BookingStartTime: timings[0],
                    BookingEndTime: timings[1],
                    CreatedTimeStamp: dateBooked,
                    Title: title
                });

            if (error) {
                console.log(error.message);
                return;
            }

            // INVALIDATE CACHE
            await this.invalidateBookingCaches(userID, roomID);

        } catch (error) {
            console.log(error.message);
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

            // INVALIDATE CACHE
            // We might not have the roomID immediately available in this context, 
            // but we can at least clear the user's booking cache and the global cache.
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
        
        // Cache user bookings for 5 minutes (300 seconds)
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