/* eslint-disable no-control-regex */
/**
 * Comprehensive Data Validation and Sanitization Module
 * Enforces strict typing, sensible boundaries, format checks, and injection prevention.
 */

// Disallowed control characters and script/injection patterns
const DANGEROUS_HTML_PATTERN = /<\s*\/?\s*(?:script|iframe|object|embed|svg|style|link|meta|img|input|form|button|a)\b[^>]*>/i;
const DANGEROUS_ATTR_PATTERN = /\b(?:on\w+|javascript:|data:text\/html|vbscript:)/i;
const CONTROL_CHARS_PATTERN = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// Standard RFC 5322 compliant regex for emails
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Person names: letters, spaces, hyphens, and apostrophes (supports accented European characters)
const PERSON_NAME_REGEX = /^[a-zA-ZÀ-ÿ]+(?:[\s'-][a-zA-ZÀ-ÿ]+)*$/;

// Safe text for titles / labels (no angle brackets, no control characters)
const SAFE_TITLE_REGEX = /^[a-zA-Z0-9À-ÿ\s.,'’"()\-–—/:;&!?#@+]+$/;

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Checks if a string contains malicious HTML or script patterns
 */
export function hasMaliciousContent(val) {
    if (typeof val !== 'string') return false;
    return DANGEROUS_HTML_PATTERN.test(val) || DANGEROUS_ATTR_PATTERN.test(val);
}

/**
 * Sanitizes generic text by stripping control characters and trimming
 */
export function sanitizeText(val) {
    if (typeof val !== 'string') return '';
    return val.replace(CONTROL_CHARS_PATTERN, '').trim();
}

/**
 * Validate Booking Title
 * Sensible rules: 2 to 100 characters, no HTML/script tags, must contain alphanumeric characters
 */
export function validateBookingTitle(title) {
    if (title === null || title === undefined || typeof title !== 'string') {
        return { isValid: false, error: 'Booking title is required and must be text.', value: '' };
    }
    const clean = sanitizeText(title);
    if (!clean) {
        return { isValid: false, error: 'Booking title cannot be empty.', value: '' };
    }
    if (clean.length < 2) {
        return { isValid: false, error: 'Booking title must be at least 2 characters long.', value: clean };
    }
    if (clean.length > 100) {
        return { isValid: false, error: 'Booking title cannot exceed 100 characters.', value: clean };
    }
    if (hasMaliciousContent(clean) || !SAFE_TITLE_REGEX.test(clean)) {
        return { isValid: false, error: 'Booking title contains invalid or prohibited characters/code.', value: clean };
    }
    if (!/[a-zA-Z0-9À-ÿ]/.test(clean)) {
        return { isValid: false, error: 'Booking title must contain at least one letter or number.', value: clean };
    }
    return { isValid: true, error: null, value: clean };
}

/**
 * Validate Booking Description
 * Sensible rules: optional, max 500 characters, no malicious scripts
 */
export function validateBookingDescription(desc, required = false) {
    if (desc === null || desc === undefined || typeof desc !== 'string') {
        if (required) {
            return { isValid: false, error: 'Description is required.', value: '' };
        }
        return { isValid: true, error: null, value: '' };
    }
    const clean = sanitizeText(desc);
    if (!clean && required) {
        return { isValid: false, error: 'Description cannot be empty.', value: '' };
    }
    if (clean.length > 500) {
        return { isValid: false, error: 'Description cannot exceed 500 characters.', value: clean };
    }
    if (hasMaliciousContent(clean)) {
        return { isValid: false, error: 'Description contains invalid or prohibited script/HTML tags.', value: clean };
    }
    return { isValid: true, error: null, value: clean };
}

/**
 * Validate Recurrence Length (Number of Bookings / Occurrences)
 * Sensible rules: integer, between 1 and 52
 */
export function validateRecurrenceLength(length) {
    if (length === null || length === undefined || length === '') {
        return { isValid: false, error: 'Number of occurrences is required.', value: 0 };
    }
    const num = Number(length);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
        return { isValid: false, error: 'Number of occurrences must be a whole number.', value: 0 };
    }
    if (num < 1) {
        return { isValid: false, error: 'Number of occurrences must be at least 1.', value: num };
    }
    if (num > 52) {
        return { isValid: false, error: 'Number of occurrences cannot exceed 52 bookings in a series.', value: num };
    }
    return { isValid: true, error: null, value: num };
}

/**
 * Validate Recurrence Frequency
 */
export function validateRecurrenceFrequency(freq, isRecurring = true) {
    if (!isRecurring) {
        return { isValid: true, error: null, value: '' };
    }
    const allowed = ['Daily', 'Weekly', 'Monthly'];
    if (typeof freq !== 'string' || !allowed.includes(freq)) {
        return { isValid: false, error: 'Please select a valid recurrence pattern (Daily, Weekly, or Monthly).', value: '' };
    }
    return { isValid: true, error: null, value: freq };
}

/**
 * Validate Room Name
 * Sensible rules: 2 to 100 characters, no HTML/script tags, must contain letters/numbers
 */
export function validateRoomName(name) {
    if (name === null || name === undefined || typeof name !== 'string') {
        return { isValid: false, error: 'Room name is required and must be text.', value: '' };
    }
    const clean = sanitizeText(name);
    if (!clean) {
        return { isValid: false, error: 'Room name cannot be empty.', value: '' };
    }
    if (clean.length < 2) {
        return { isValid: false, error: 'Room name must be at least 2 characters long.', value: clean };
    }
    if (clean.length > 100) {
        return { isValid: false, error: 'Room name cannot exceed 100 characters.', value: clean };
    }
    if (hasMaliciousContent(clean) || !SAFE_TITLE_REGEX.test(clean)) {
        return { isValid: false, error: 'Room name contains invalid or prohibited characters/code.', value: clean };
    }
    if (!/[a-zA-Z0-9À-ÿ]/.test(clean)) {
        return { isValid: false, error: 'Room name must contain at least one letter or number.', value: clean };
    }
    return { isValid: true, error: null, value: clean };
}

/**
 * Validate Room Location
 * Sensible rules: optional or required, max 100 characters, no HTML/scripts
 */
export function validateRoomLocation(location, required = false) {
    if (location === null || location === undefined || typeof location !== 'string') {
        if (required) {
            return { isValid: false, error: 'Room location is required.', value: '' };
        }
        return { isValid: true, error: null, value: '' };
    }
    const clean = sanitizeText(location);
    if (!clean && required) {
        return { isValid: false, error: 'Room location cannot be empty.', value: '' };
    }
    if (clean && clean.length < 2) {
        return { isValid: false, error: 'Room location must be at least 2 characters long.', value: clean };
    }
    if (clean.length > 100) {
        return { isValid: false, error: 'Room location cannot exceed 100 characters.', value: clean };
    }
    if (hasMaliciousContent(clean) || (clean && !SAFE_TITLE_REGEX.test(clean))) {
        return { isValid: false, error: 'Room location contains invalid or prohibited characters.', value: clean };
    }
    return { isValid: true, error: null, value: clean };
}

/**
 * Validate Room Capacity
 * Sensible rules: integer, between 1 and 1000
 */
export function validateRoomCapacity(capacity) {
    if (capacity === null || capacity === undefined || capacity === '') {
        return { isValid: false, error: 'Room capacity is required.', value: 0 };
    }
    const num = Number(capacity);
    if (!Number.isFinite(num) || !Number.isInteger(num)) {
        return { isValid: false, error: 'Room capacity must be a whole number.', value: 0 };
    }
    if (num < 1) {
        return { isValid: false, error: 'Room capacity must be at least 1 seat.', value: num };
    }
    if (num > 1000) {
        return { isValid: false, error: 'Room capacity cannot exceed 1,000 seats.', value: num };
    }
    return { isValid: true, error: null, value: num };
}

/**
 * Validate Room Features
 * Sensible rules: optional, max 500 characters, no malicious scripts
 */
export function validateRoomFeatures(features) {
    if (features === null || features === undefined || typeof features !== 'string') {
        return { isValid: true, error: null, value: '' };
    }
    const clean = sanitizeText(features);
    if (clean.length > 500) {
        return { isValid: false, error: 'Room features description cannot exceed 500 characters.', value: clean };
    }
    if (hasMaliciousContent(clean)) {
        return { isValid: false, error: 'Room features contain prohibited script or HTML tags.', value: clean };
    }
    return { isValid: true, error: null, value: clean };
}

/**
 * Validate Category Name
 * Sensible rules: 2 to 50 characters, safe characters, non-duplicate
 */
export function validateCategoryName(name, existingCategories = []) {
    if (name === null || name === undefined || typeof name !== 'string') {
        return { isValid: false, error: 'Category name is required and must be text.', value: '' };
    }
    const clean = sanitizeText(name);
    if (!clean) {
        return { isValid: false, error: 'Category name cannot be empty.', value: '' };
    }
    if (clean.length < 2) {
        return { isValid: false, error: 'Category name must be at least 2 characters long.', value: clean };
    }
    if (clean.length > 50) {
        return { isValid: false, error: 'Category name cannot exceed 50 characters.', value: clean };
    }
    if (hasMaliciousContent(clean) || !SAFE_TITLE_REGEX.test(clean)) {
        return { isValid: false, error: 'Category name contains invalid or prohibited characters.', value: clean };
    }
    if (!/[a-zA-Z0-9À-ÿ]/.test(clean)) {
        return { isValid: false, error: 'Category name must contain at least one letter or number.', value: clean };
    }
    // Check for duplicates (case-insensitive)
    const lower = clean.toLowerCase();
    const isDuplicate = existingCategories.some(cat => {
        const catName = typeof cat === 'string' ? cat : cat?.name;
        return catName && catName.toLowerCase().trim() === lower;
    });
    if (isDuplicate) {
        return { isValid: false, error: `Category "${clean}" already exists.`, value: clean };
    }
    return { isValid: true, error: null, value: clean };
}

/**
 * Validate Person Name (Firstname / Surname)
 * Sensible rules: 2 to 50 characters, letters, hyphens, spaces, apostrophes only
 */
export function validatePersonName(name, fieldName = 'Name') {
    if (name === null || name === undefined || typeof name !== 'string') {
        return { isValid: false, error: `${fieldName} is required and must be text.`, value: '' };
    }
    const clean = sanitizeText(name);
    if (!clean) {
        return { isValid: false, error: `${fieldName} cannot be empty.`, value: '' };
    }
    if (clean.length < 2) {
        return { isValid: false, error: `${fieldName} must be at least 2 characters long.`, value: clean };
    }
    if (clean.length > 50) {
        return { isValid: false, error: `${fieldName} cannot exceed 50 characters.`, value: clean };
    }
    if (hasMaliciousContent(clean) || !PERSON_NAME_REGEX.test(clean)) {
        return { isValid: false, error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes.`, value: clean };
    }
    return { isValid: true, error: null, value: clean };
}

/**
 * Validate Email Address
 * Sensible rules: RFC 5322 compliant, max 254 chars, valid format
 */
export function validateEmail(email) {
    if (email === null || email === undefined || typeof email !== 'string') {
        return { isValid: false, error: 'Email address is required.', value: '' };
    }
    const clean = email.trim();
    if (!clean) {
        return { isValid: false, error: 'Email address cannot be empty.', value: '' };
    }
    if (clean.length > 254) {
        return { isValid: false, error: 'Email address cannot exceed 254 characters.', value: clean };
    }
    if (hasMaliciousContent(clean) || !EMAIL_REGEX.test(clean)) {
        return { isValid: false, error: `"${clean}" is not a valid email address.`, value: clean };
    }
    return { isValid: true, error: null, value: clean.toLowerCase() };
}

/**
 * Validate Password
 * Sensible rules: 8 to 100 characters, uppercase, lowercase, number, special character
 */
export function validatePassword(password) {
    if (password === null || password === undefined || typeof password !== 'string') {
        return { isValid: false, error: 'Password is required.', value: '' };
    }
    if (password.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters long.', value: password };
    }
    if (password.length > 100) {
        return { isValid: false, error: 'Password cannot exceed 100 characters.', value: password };
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one uppercase letter.', value: password };
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one lowercase letter.', value: password };
    }
    if (!/[0-9]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one number.', value: password };
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one special character.', value: password };
    }
    return { isValid: true, error: null, value: password };
}

/**
 * Validate Date string (YYYY-MM-DD)
 * Checks format and valid calendar day (e.g. rejects 2026-02-31)
 */
export function validateDate(dateStr) {
    if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return { isValid: false, error: 'Date must be in YYYY-MM-DD format.', value: '' };
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    if (year < 2020 || year > 2100) {
        return { isValid: false, error: 'Date year is outside the acceptable range (2020-2100).', value: dateStr };
    }
    if (month < 1 || month > 12) {
        return { isValid: false, error: 'Date month must be between 01 and 12.', value: dateStr };
    }
    const maxDays = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDays) {
        return { isValid: false, error: `Invalid day for month ${month}: must be between 01 and ${maxDays}.`, value: dateStr };
    }
    return { isValid: true, error: null, value: dateStr };
}

/**
 * Validate Date Range (startDate <= endDate)
 */
export function validateDateRange(startDate, endDate) {
    const startVal = validateDate(startDate);
    if (!startVal.isValid) return startVal;
    const endVal = validateDate(endDate);
    if (!endVal.isValid) return endVal;

    if (new Date(startDate).getTime() > new Date(endDate).getTime()) {
        return { isValid: false, error: 'Start date cannot be after end date.', value: null };
    }
    return { isValid: true, error: null, value: { startDate, endDate } };
}

/**
 * Validate Time Duration (Format: "HH:MM - HH:MM")
 */
export function validateTimeDuration(duration) {
    if (typeof duration !== 'string') {
        return { isValid: false, error: 'Time duration is required.', value: '' };
    }
    const parts = duration.split(' - ');
    if (parts.length !== 2) {
        return { isValid: false, error: 'Time duration must be in "HH:MM - HH:MM" format.', value: duration };
    }
    const [start, end] = parts;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(start) || !timeRegex.test(end)) {
        return { isValid: false, error: 'Time format must be valid 24-hour time (HH:MM).', value: duration };
    }
    if (start >= end) {
        return { isValid: false, error: 'End time must be later than start time.', value: duration };
    }
    return { isValid: true, error: null, value: duration };
}

/**
 * Validate Positive Integer ID
 */
export function validateId(id, fieldName = 'ID') {
    if (id === null || id === undefined || id === '') {
        return { isValid: false, error: `${fieldName} is required.`, value: 0 };
    }
    // If it's a UUID string
    if (typeof id === 'string' && UUID_REGEX.test(id)) {
        return { isValid: true, error: null, value: id };
    }
    const num = Number(id);
    if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) {
        return { isValid: false, error: `${fieldName} must be a valid positive identifier.`, value: 0 };
    }
    return { isValid: true, error: null, value: num };
}

/**
 * Validate UUID string
 */
export function validateUuid(uuid, fieldName = 'ID') {
    if (typeof uuid !== 'string' || !UUID_REGEX.test(uuid.trim())) {
        return { isValid: false, error: `${fieldName} must be a valid UUID.`, value: '' };
    }
    return { isValid: true, error: null, value: uuid.trim() };
}

/**
 * Validate Search Term
 * Max length default 100, sanitized, rejects malicious script/injection
 */
export function validateSearchTerm(term, maxLength = 100) {
    if (term === null || term === undefined) {
        return { isValid: true, error: null, value: '' };
    }
    if (typeof term !== 'string') {
        return { isValid: false, error: 'Search term must be text.', value: '' };
    }
    const clean = sanitizeText(term);
    if (hasMaliciousContent(clean)) {
        return { isValid: false, error: 'Search term contains invalid or prohibited code.', value: '' };
    }
    const truncated = clean.slice(0, maxLength);
    return { isValid: true, error: null, value: truncated };
}
