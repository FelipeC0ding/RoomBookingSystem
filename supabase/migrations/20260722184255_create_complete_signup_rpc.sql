CREATE OR REPLACE FUNCTION public.complete_signup(
    p_firstname text,
    p_surname text,
    p_department_id int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_org_id int;
    v_role text;
BEGIN
    -- Ensure the call is authenticated
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Safely extract org_id and role from JWT claims (or fallback to app_metadata)
    v_org_id := COALESCE(
        (nullif(auth.jwt()->>'organisation_id', ''))::int,
        (auth.jwt()->'app_metadata'->>'organisation_id')::int
    );
    v_role := COALESCE(
        auth.jwt()->>'user_role',
        auth.jwt()->'app_metadata'->>'user_role',
        'student'
    );

    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'Missing organisation_id in authentication token';
    END IF;

    -- Upsert profile row in public."User" table
    INSERT INTO public."User" ("UserID", "Firstname", "Surname", "OrganisationID", "Role", "DepartmentID")
    VALUES (v_user_id, p_firstname, p_surname, v_org_id, v_role, p_department_id)
    ON CONFLICT ("UserID") DO UPDATE
    SET 
        "Firstname" = EXCLUDED."Firstname",
        "Surname"   = EXCLUDED."Surname",
        "OrganisationID" = EXCLUDED."OrganisationID",
        "Role"      = EXCLUDED."Role",
        "DepartmentID" = EXCLUDED."DepartmentID";
END;
$$;

-- Grant execution permission to authenticated users
GRANT EXECUTE ON FUNCTION public.complete_signup(text, text, int) TO authenticated;