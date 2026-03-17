import { data } from 'autoprefixer';
import { supabase } from '../supabaseClient';
export default class FetchDAL {

    static async AddUser(userID,email, firstname, surname, role, OrganisationID, departmentID) {
        try {
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
            return false;
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
        for(let i = 0; i <dateList.length; i++){
            formattedList.push(dateList[i].toISOString().split('T')[0])
        }
        return formattedList
    }
    static async createMonthlyRecurringBooking(description, roomID, bookingDate, duration, title, frequency, recurrenceLength, monthlyOrdinal, monthlyWeekday, monthlyType) {
        const timings = duration.split(" - ");
        let date = new Date(bookingDate);
        let user = await this.getUserData();
        let userID = user.id;
        const dateBooked = new Date().toISOString().split('T')[0];
        let checkDate = new Date(bookingDate);
        let datesToBook = [];

        console.log('Monthly fixed DATA:', userID, description, roomID, bookingDate, duration, title, recurrenceLength, monthlyOrdinal, monthlyWeekday, monthlyType)
        console.log(monthlyType)

        while (datesToBook.length < recurrenceLength) {
            if (this.isWeekend(checkDate)) {
                let jump = (checkDate.getDay() === 6) ? 2 : 0;
                checkDate.setDate(checkDate.getDate() + jump);
            }
            datesToBook.push(checkDate.toISOString().split('T')[0]);
            checkDate.setDate(checkDate.getDate() + 1);
        }

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

        if (monthlyType.toLowerCase() === 'fixed') {
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
            let bookingDates = await this.createSpecificWeekdayBookings(bookingDate, monthlyWeekday, monthlyOrdinal, recurrenceLength);
            let dateStrings = this.formatDates(bookingDates); 
            
           const { data: conflicts, error: checkError } = await supabase
                .from('Booking')
                .select('BookingDate')
                .eq('RoomID', parseInt(roomID))
                .eq('BookingStartTime', timings[0] + ':00')
                .in('BookingDate', targetDates);

            if (checkError) return false;
            
            // If ANY of the dates are taken, we stop here. 
            // No rows have been inserted yet!
            if (conflicts && conflicts.length > 0) {
                console.log("Conflicts found on these dates:", conflicts);
                return false; 
            }

            // --- STEP 3: BULK INSERT (ALL OR NOTHING) ---
            const rowsToInsert = targetDates.map(dateStr => ({
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
                console.error("Bulk insert failed:", insertError.message);
                return false;
            }

            return true; // Success!
        }
    }

    static createSpecificWeekdayBookings(bookingDate, targetDay, targetOrdinal, recurrenceLength) {
        let date = new Date(bookingDate);
        date.setDate(1);

        let bookingsCreated = 0;
        let results = [];

        while (bookingsCreated < recurrenceLength) {
            let occurrenceCounter = 0;
            let monthFinished = false;
            let currentMonth = date.getMonth();

            while (!monthFinished) {
                if (date.getDay() === parseInt(targetDay)) {
                    occurrenceCounter++;
                    if (occurrenceCounter === parseInt(targetOrdinal)) {
                        results.push(new Date(date));
                        bookingsCreated++;
                        monthFinished = true;
                    }
                }

                date.setDate(date.getDate() + 1);
                if (date.getMonth() !== currentMonth) {
                    monthFinished = true;
                }
            }
            date.setMonth(date.getMonth());
        }
        return results;
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

    static async createRecurringBooking(description, roomID, bookingDate, duration, title, frequency, recurrenceLength) {
        try {
            let bookingCreated = true
            let user = await this.getUserData();
            let userID = user.id;
            const dateBooked = new Date().toISOString().split('T')[0];
            const freq = frequency.toLowerCase();
            let spacing = 1;

            if (freq === 'daily') {
                spacing = 1;
                console.log('Processing Daily');
                bookingCreated = await this.createDailyBooking(userID, description, roomID, bookingDate, duration, title, recurrenceLength, dateBooked);
                return bookingCreated
            }
            else if (freq === 'weekly') {
                bookingCreated = await this.createWeeklyBooking(userID, description, roomID, bookingDate, duration, title, recurrenceLength, dateBooked)
                return bookingCreated
            }
        }
        catch (error) {
            console.error("Recurrence Error:", error.message);
        }

    }

    static async createBooking(description, roomID, bookingDate, duration, title) {
        try {
            let user = await this.getUserData();
            let userID = user.id;
            const date = new Date();
            const dateBooked = date.toISOString().split('T')[0];
            const timings = duration.split(" - ")
            console.log(userID)
            console.log(timings)
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
                })
        }
        catch (error) {
            console.log(error.message)
        }
    }
    static async updateBooking(bookingID, title, description) {
        console.log(bookingID, title, description)
        try {
            const { error } = await supabase
                .from('Booking')
                .update({ 'Title': title, 'Description': description })
                .eq('BookingID', bookingID)
        }
        catch (error) {

        }

        console.log(this.fetchUserBookings())

    }
    static async fetchUserBookings(userId) {
        const { data, error } = await supabase
            .from('Booking')
            .select(`
                *,
                Room ( RoomName, Capacity )
            `)
            .eq('UserID', userId)
            .order('BookingDate', { ascending: false });

        if (error) throw error;
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
        console.log("--- Executing Supabase fetch ---");
        const { data, error } = await supabase
            .from('Organisation')
            .select('OrganisationID,Name,StartTime,FinishTime,IntervalDuration,IntervalName,LunchStart, LunchEnd, BreakStart, BreakEnd')
            .eq('LisenceStatus', true)

        if (error) {
            throw error
        } else {
            console.log('SUCCESS:', data);
        }
        return data
    }

    static async getRooms(){
        console.log('Getting Rooms')
        let userConfirmed = await this.getCurrentUser()
        console.log('User Object:', userConfirmed);
        let orgID = userConfirmed.OrganisationID
        userConfirmed = userConfirmed.Confirmed

        const{data, error} = await supabase
            .from('Room')
            .select('*')
            .eq('IsAvailable', true)
            .eq('OrganisationID', orgID)

        if (error) {
            console.log(error.message, error.code)
        } else {
            console.log('SUCCESS:', data);
        }
        if(userConfirmed){
           return data
        }
        else{
            return null
        }
    }

    static async AddNewRoom(title, location, capacity, features) {
        try {
            let capacityFormatted = parseInt(capacity);
            let orgID = await this.loggedInOrgID();
            orgID = parseInt(orgID)
            console.log('adding a new room', title, location, capacityFormatted, features, orgID)
            const { error } = await supabase
                .from('Room')
                .insert({ RoomName: title, Capacity: capacityFormatted, IsAvailable: true, Location: location, Features: features, OrganisationID: orgID })
        }
        catch (error) {
            console.log(error.message)
        }
    }

    static async deleteRoom(roomID) {
        console.log('toomid for delte', roomID)
        let id = parseInt(roomID)
        const { error } = await supabase
            .from('Room')
            .delete()
            .eq('RoomID', id)
        if (error) {
            console.log(error.message, error.code)

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
        organisationID = await this.GetOrganisationID(organisationID)
        console.log("--- Executing Dept fetch ---");
        const { data, error } = await supabase
            .from('Department')
            .select('DepartmentID,Name')
            .eq('OrganisationID', organisationID)

        if (error) {
            console.log(error)
            throw error
        } else {
            console.log(organisationID);
        }

        return data

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
            let id = parseInt(bookingID)
            console.log(bookingID)
            const response = await supabase
                .from('Booking')
                .delete()
                .eq('BookingID', id)
        }
        catch (error) {
            console.log('deleting user error-', error.message)
        }

    }
}