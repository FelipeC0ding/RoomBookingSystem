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
                    },
                  },
            });
        const { data, error } = await supabase
            .from('User')
            .insert([{
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

        } else {
        }
    };

    static async GetSchools(){
        console.log("--- Executing Supabase fetch ---");
        const{data, error} = await supabase
            .from('Organisation')
            .select('OrganisationID,Name,StartTime,FinishTime,IntervalDuration,IntervalName')
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
}
