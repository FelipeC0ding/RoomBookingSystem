import { supabase } from '../supabaseClient';
export default class FetchDAL{

    static async AddUser (email,firstname, surname, role, departmentID, OrganisationID) {
        console.log("--- Executing Supabase Insert ---");
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

    static async GetOrganisationID(Name){
            console.log("--- Executing Dept fetch ---");
            const{data, error} = await supabase
                .from('Organisation')
                .select('OrganisationID')
                .eq('Name',Name)
                .single()

            if (error) {
                throw error
            } else {
                alert(data);
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
}
