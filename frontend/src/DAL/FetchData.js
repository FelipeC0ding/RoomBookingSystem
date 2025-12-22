import { supabase } from '../supabaseClient';
export default class FetchDAL{

    static async AddUser (email,firstname, surname, role, department) {
        console.log("--- Executing Supabase Insert ---");
        const { data, error } = await supabase
            .from('User')
            .insert([{
                UserEmail: email,
                Firstname: firstname,
                Surname: surname,
                Role: role,
                DepartmentID: department
            }]);

        if (error) {
            throw error
        } else {
            console.log('SUCCESS:', data[0]);
            alert('SUCCESS: Test user added to database!');
        }
    };

    static async GetSchools(){
        console.log("--- Executing Supabase fetch ---");
        const{data, error} = await supabase
            .from('Organisation')
            .select('OrganisationID,Name')

        if (error) {
            throw error
        } else {
            console.log('SUCCESS:', data);
            alert('SUCCESS: Data fetched!');
        }

        return data

    }
}
