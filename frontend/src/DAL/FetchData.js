import { data } from 'autoprefixer';
import { supabase } from '../supabaseClient';
export default class FetchDAL{

    static async AddUser (email,password, passwordConfirm ,firstname, surname, role, OrganisationID, departmentID) {
        console.log("--- Executing Supabase Insert ---");
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
                Role: 'Teahcer',
                DepartmentID: departmentID,
                OrganisationID: OrganisationID
            }]);

        if (error) {
            console.log(error.message)
            throw error

        }
    };

    static async getUserData(){
        const { data: { user } } = await supabase.auth.getUser();
        console.log(data)
        return user
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

        console.log(data)
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
            .select('RoomID,RoomName, Capacity,Location, Features, OrganisationID')
            .eq('IsAvailable', true)

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
