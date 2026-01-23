import { data } from 'autoprefixer';
import { supabase } from '../supabaseClient';
export default class FetchDAL{

    static async AddUser (email,password ,firstname, surname, role, OrganisationID, departmentID) {
        console.log("--- Executing Supabase Insert ---");
        try{
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                      organisation_id: OrganisationID,
                      Firstname:firstname,
                      Surname:surname,
                    },
                  },
            });
            const supabaseAuthId = authData.user.id;
            const { data, error } = await supabase
                .from('User')
                .insert([{
                    UserID: supabaseAuthId,
                    UserEmail: email,
                    Firstname: firstname,
                    Surname: surname,
                    Role: role,
                    DepartmentID: departmentID,
                    OrganisationID: OrganisationID
                }]);

            if (error) {
                console.log(error.message)
                throw error

            }
        }
        catch(error){

            console.log('user creation error',error)
        }
    };

    static async deleteUser(userID){
        console.log('toomid for delte',roomID)
        let id = parseInt(roomID)
        const {error} = await supabase
            .from('Room')
            .delete()
            .eq('RoomID', id)
        if (error) {
        console.log(error.message, error.code)
        
        }
    }

    static async getAllUsers(){
        const { data, error } = await supabase
            .from('User')
            .select(`*`);

        if (error) throw error;
        console.log('All Users',data)
        return data;
    }
    static async getCurrentUser(){
        let user = await this.getUserData();
        let uid = user.id
        console.log('ID -', uid);
        const{data, error} = await supabase
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

    static async makeAdmin(userID){
        console.log('UserID to be admin', userID)
        try{
            const { error } = await supabase
              .from('User')
              .update({ 'Role': 'admin'})
              .eq('UserID', userID)
        }
        catch(error){
            console.log(error.message)
        }

    }
    static async removeAdmin(userID){
        console.log('UserID to have admin revoked', userID)
        try{
            const { error } = await supabase
              .from('User')
              .update({ 'Role': 'standard'})
              .eq('UserID', userID)
        }
        catch(error){
            console.log(error.message)
        }

    }

    static async getUserData(){
        const { data, error } = await supabase.auth.getUser();
        if(error){
            console.log(error.message)
            return null
        }
        else{
            console.log('Current user',data.user)
            return data.user
        }

    }
    static isWeekend(date){
        if(date.getDay() === 6 || date.getDay() === 0){
            return true
        }
    }
    static async createDailyBooking(userID, description, roomID, bookingDate, duration, title, recurrenceLength, dateBooked) {
        const timings = duration.split(" - ");
        let date = new Date(bookingDate);

        console.log('DAILY DATA:',userID, description, roomID, bookingDate, duration, title, recurrenceLength, dateBooked)
        for (let index = 0; index < recurrenceLength; index++) {
            
            if (this.isWeekend(date)) {
                let jump = (date.getDay() === 6 || date.getDay() === 0) ? 2 : 1;
                date.setDate(date.getDate() + jump);
            }

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
                
            if (error) throw error;

            date.setDate(date.getDate() + 1);
        }
    }
    static async createMonthlyRecurringBooking(description, roomID, bookingDate,duration, title, frequency,recurrenceLength, monthlyOrdinal, monthlyWeekday,monthlyType){
        const timings = duration.split(" - ");
        let date = new Date(bookingDate);
        const ordinal = monthlyOrdinal.toLowerCase();
        let user = await this.getUserData();
        let userID = user.id;
        const dateBooked = new Date().toISOString().split('T')[0];

        console.log('Monthly fixed DATA:',userID, description, roomID, bookingDate, duration, title, recurrenceLength, dateBooked)

        if(monthlyType.toLowerCase() === 'fixed'){
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
                    
                if (error) throw error;
                console.log(date);
                date.setMonth(date.getMonth() + 1);
            }
        }
        else if(monthlyType.toLowerCase() === 'ordinal'){
            let bookingDates = this.createSpecificWeekdayBookings()
            
            for(let index = 0; index < 1; index++){
                const { error } = await supabase
                    .from('Booking')
                    .insert({
                        Description: description,
                        RoomID: roomID,
                        UserID: userID,
                        BookingDate: bookingDates[index].toISOString().split('T')[0], 
                        BookingStartTime: timings[0],
                        BookingEndTime: timings[1],
                        CreatedTimeStamp: dateBooked,
                        Title: title
                    });
                    
                if (error) throw error;
            }
        }
    }

    static createSpecificWeekdayBookings(userID, roomID, bookingDate, duration, title, targetDay, targetOrdinal, recurrenceLength) {
    let date = new Date(bookingDate);
    date.setDate(1); 
    
    let bookingsCreated = 0;
    let results = [];

    while (bookingsCreated < recurrenceLength) {
        let occurrenceCounter = 0;
        let monthFinished = false;
        let currentMonth = date.getMonth();

        while (!monthFinished) {
            if (date.getDay() === targetDay) {
                occurrenceCounter++;
                if (occurrenceCounter === targetOrdinal) {
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
        date.setDate(1);
    }
    return results;
}

    static async createRecurringBooking(description, roomID, bookingDate,duration, title, frequency,recurrenceLength){
        try {
            let user = await this.getUserData();
            let userID = user.id;
            const dateBooked = new Date().toISOString().split('T')[0];
            const freq = frequency.toLowerCase();
            let spacing = 1; 
            
            if (freq === 'daily') {
                spacing = 1;
                console.log('Processing Daily');
                this.createDailyBooking(userID,description, roomID, bookingDate,duration, title,recurrenceLength,dateBooked);
            } 
            else if (freq === 'weekly') 
            {
                spacing = 7;
                console.log('Processing Weekly');
                
                const timings = duration.split(" - ");
                let currentBookings = await this.fetchAllBookings();
                let spaceFree = true;

                console.log("--- Executing booking Insert for recurrence ---");
                for (let index = 0; index < recurrenceLength; index++) {
                    let date = new Date(bookingDate);
                    date.setDate(date.getDate() + (spacing * index));

                    for(let i =0; i < (currentBookings).length; i++){
                        let currentDate = currentBookings[i].BookingDate
                        let newbookingDate = date.toISOString().split('T')[0]
                        let RoomID = parseInt(currentBookings[i].RoomID)
                        roomID = parseInt(roomID)
                        let currentTime = currentBookings[i].BookingStartTime.substring(0, 5); 
                        if(currentDate === newbookingDate && RoomID === roomID && currentTime === timings[0]){
                            console.log("Slot has been booked on", newbookingDate)
                            spaceFree = false;
                            break;
                        }
                    }
                    if(!spaceFree) break;
                    
                    
                }
                if(spaceFree)
                {
                    for (let index = 0; index < recurrenceLength; index++) 
                    {
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
                            
                        if (error) throw error; 
                    }
                }
                console.log(await this.fetchUserBookings());
                
            } 
        }   
        catch (error) {
            console.error("Recurrence Error:", error.message);
        }         
            
    }

    static async createBooking(description, roomID, bookingDate,duration, title){
        try{
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
        catch(error){
            console.log(error.message)
        }
    }
    static async updateBooking(bookingID, title, description){
        console.log(bookingID,title,description)
        try{
            const { error } = await supabase
              .from('Booking')
              .update({ 'Title': title, 'Description': description})
              .eq('BookingID', bookingID)
        }
        catch(error){

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

    static async fetchBookings(bookingDate){
        try{
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

        console.log('Bookings',data)
        return data

        }
        catch(error){
            console.log(error.message)
        }
    }

    static async fetchAllBookings(){
        try{
        const { data, error } = await supabase
            .from('Booking')
            .select(`
                *`
            )

        console.log('Bookings',data)
        return data
        }
        catch(error){
            console.log(error.message)
        }



    }
    static async loggedInOrgID(){
        const result = await supabase.auth.getUser();
        const user = result.data.user
        console.log('property',user?.user_metadata?.organisation_id)
        return user?.user_metadata?.organisation_id
    }

    static async GetSchools(){
        console.log("--- Executing Supabase fetch ---");
        const{data, error} = await supabase
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

        const{data, error} = await supabase
            .from('Room')
            .select('*')
            .eq('IsAvailable', true)

        if (error) {
            console.log(error.message, error.code)
        } else {
            console.log('SUCCESS:', data);
        }

        return data
    }
    static async AddNewRoom(title, location, capacity, features){
        
        try{
            let capacityFormatted = parseInt(capacity);
            let orgID = await this.loggedInOrgID();
            orgID = parseInt(orgID)
            console.log('adding a new room', title, location, capacityFormatted, features, orgID)
            const { error } = await supabase
                .from('Room')
                .insert({RoomName: title, Capacity: capacityFormatted, IsAvailable:true, Location: location, Features: features, OrganisationID: orgID})
        }
        catch(error){
            console.log(error.message)
        }
    }

    static async deleteRoom(roomID){
            console.log('toomid for delte',roomID)
            let id = parseInt(roomID)
            const {error} = await supabase
              .from('Room')
              .delete()
              .eq('RoomID', id)
            if (error) {
            console.log(error.message, error.code)
            
            }

    }

    static async UpdateRooms(id,roomName, location, capacity, features){
        console.log('Saving room changes', id, roomName, location, capacity, features)

        const { error } = await supabase
          .from('Room')
          .update({ 'RoomName': roomName, 'Location': location, 'Capacity':parseInt(capacity), 'Features':features})
          .eq('RoomID', parseInt(id))
        if (error) {
            console.log(error.message, error.code)
        } else {
            console.log('SUCCESS:', data);
        }

        return data
    }

    static async GetOrganisationID(Name){
            console.log("--- Executing Dept fetch ---");
            const{data, error} = await supabase
                .from('Organisation')
                .select('OrganisationID')
                .eq('Name',Name)
                .single()

            if (error) {
                throw error
            }
                console.log('IMPORTANT:', data);

            return data.OrganisationID
        }

    static async GetDepartments(organisationID){
        organisationID = await this.GetOrganisationID(organisationID)
        console.log("--- Executing Dept fetch ---");
        const{data, error} = await supabase
            .from('Department')
            .select('DepartmentID,Name')
            .eq('OrganisationID',organisationID)

        if (error) {
        console.log(error)
            throw error
        } else {
            console.log(organisationID);
        }

        return data

    }

    static async GetDepartmentID(Name){
        console.log("--- Executing DeptID fetch ---");
        const{data, error} = await supabase
            .from('Department')
            .select('DepartmentID')
            .eq('Name',Name)
            .single()

        if (error) {
        console.log(error)
            throw error
        } else {
            console.log('Name',Name);
        }

        return data.DepartmentID
    }

     static async GetDepartmentName(id){
        console.log("--- Executing DeptName fetch ---");
        const{data, error} = await supabase
            .from('Department')
            .select('Name')
            .eq('DepartmentID',parseInt(id))
            .single()

        if (error) {
        console.log(error)
            throw error
        } else {
            console.log('Name',Name);
        }

        return data.Name
    }

    static async deleteBooking(bookingID){
        try{
            let id = parseInt(bookingID)
            console.log(bookingID)
            const response = await supabase
              .from('Booking')
              .delete()
              .eq('BookingID', id)
        }
        catch(error){
            console.log('deleting user error-',error.message)
        }

    }
}