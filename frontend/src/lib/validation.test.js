import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    validateBookingTitle,
    validateBookingDescription,
    validateRecurrenceLength,
    validateRecurrenceFrequency,
    validateRoomName,
    validateRoomLocation,
    validateRoomCapacity,
    validateRoomFeatures,
    validateCategoryName,
    validatePersonName,
    validateEmail,
    validatePassword,
    validateDate,
    validateDateRange,
    validateTimeDuration,
    validateId,
    validateUuid,
    hasMaliciousContent,
    sanitizeText,
    validateSearchTerm
} from './validation.js';

test('validateBookingTitle', () => {
    // Valid titles
    assert.equal(validateBookingTitle('Year 8 Maths').isValid, true);
    assert.equal(validateBookingTitle('Science Lab (Period 3)').isValid, true);
    assert.equal(validateBookingTitle('Art & Design 101').isValid, true);

    // Invalid titles
    assert.equal(validateBookingTitle('').isValid, false);
    assert.equal(validateBookingTitle('   ').isValid, false);
    assert.equal(validateBookingTitle('A').isValid, false); // too short
    assert.equal(validateBookingTitle('A'.repeat(101)).isValid, false); // too long
    assert.equal(validateBookingTitle('<script>alert("xss")</script>').isValid, false); // XSS
    assert.equal(validateBookingTitle('Meeting <img src=x onerror=alert(1)>').isValid, false); // HTML tag
    assert.equal(validateBookingTitle('---...').isValid, false); // no alphanumeric
    assert.equal(validateBookingTitle(12345).isValid, false); // wrong type
});

test('validateBookingDescription', () => {
    // Valid
    assert.equal(validateBookingDescription('End of unit assessment').isValid, true);
    assert.equal(validateBookingDescription('').isValid, true); // optional
    assert.equal(validateBookingDescription(null).isValid, true); // optional

    // Invalid
    assert.equal(validateBookingDescription('<script>eval(1)</script>').isValid, false);
    assert.equal(validateBookingDescription('javascript:alert(1)').isValid, false);
    assert.equal(validateBookingDescription('a'.repeat(501)).isValid, false); // too long
    assert.equal(validateBookingDescription('', true).isValid, false); // required but empty
});

test('validateRecurrenceLength', () => {
    // Valid
    assert.equal(validateRecurrenceLength(1).isValid, true);
    assert.equal(validateRecurrenceLength(4).isValid, true);
    assert.equal(validateRecurrenceLength(52).isValid, true);
    assert.equal(validateRecurrenceLength('10').isValid, true);

    // Invalid
    assert.equal(validateRecurrenceLength(0).isValid, false);
    assert.equal(validateRecurrenceLength(-5).isValid, false);
    assert.equal(validateRecurrenceLength(53).isValid, false);
    assert.equal(validateRecurrenceLength(9999).isValid, false);
    assert.equal(validateRecurrenceLength(2.5).isValid, false); // decimal
    assert.equal(validateRecurrenceLength('abc').isValid, false);
    assert.equal(validateRecurrenceLength('').isValid, false);
});

test('validateRecurrenceFrequency', () => {
    assert.equal(validateRecurrenceFrequency('Daily', true).isValid, true);
    assert.equal(validateRecurrenceFrequency('Weekly', true).isValid, true);
    assert.equal(validateRecurrenceFrequency('Monthly', true).isValid, true);
    assert.equal(validateRecurrenceFrequency('Yearly', true).isValid, false);
    assert.equal(validateRecurrenceFrequency('', true).isValid, false);
    assert.equal(validateRecurrenceFrequency('', false).isValid, true);
});

test('validateRoomName', () => {
    // Valid
    assert.equal(validateRoomName('Innovation Hub').isValid, true);
    assert.equal(validateRoomName('Lab 102 (Bio)').isValid, true);

    // Invalid
    assert.equal(validateRoomName('').isValid, false);
    assert.equal(validateRoomName('A').isValid, false);
    assert.equal(validateRoomName('A'.repeat(101)).isValid, false);
    assert.equal(validateRoomName('<iframe src="evil.com"></iframe>').isValid, false);
    assert.equal(validateRoomName(null).isValid, false);
});

test('validateRoomCapacity', () => {
    // Valid
    assert.equal(validateRoomCapacity(1).isValid, true);
    assert.equal(validateRoomCapacity(30).isValid, true);
    assert.equal(validateRoomCapacity('100').isValid, true);
    assert.equal(validateRoomCapacity(1000).isValid, true);

    // Invalid
    assert.equal(validateRoomCapacity(0).isValid, false);
    assert.equal(validateRoomCapacity(-10).isValid, false);
    assert.equal(validateRoomCapacity(1001).isValid, false);
    assert.equal(validateRoomCapacity(20.5).isValid, false);
    assert.equal(validateRoomCapacity('thirty').isValid, false);
    assert.equal(validateRoomCapacity('').isValid, false);
});

test('validateCategoryName', () => {
    const existing = [{ name: 'Science Lab' }, { name: 'IT Suite' }];
    // Valid
    assert.equal(validateCategoryName('Art Room', existing).isValid, true);
    assert.equal(validateCategoryName('Hall & Stage', existing).isValid, true);

    // Invalid
    assert.equal(validateCategoryName('Science Lab', existing).isValid, false); // duplicate
    assert.equal(validateCategoryName('science lab', existing).isValid, false); // case-insensitive duplicate
    assert.equal(validateCategoryName('', existing).isValid, false);
    assert.equal(validateCategoryName('X', existing).isValid, false); // too short
    assert.equal(validateCategoryName('<script>', existing).isValid, false);
});

test('validatePersonName', () => {
    // Valid
    assert.equal(validatePersonName('Jane', 'Firstname').isValid, true);
    assert.equal(validatePersonName("O'Connor", 'Surname').isValid, true);
    assert.equal(validatePersonName('Jean-Luc', 'Firstname').isValid, true);
    assert.equal(validatePersonName('María', 'Firstname').isValid, true);

    // Invalid
    assert.equal(validatePersonName('', 'Firstname').isValid, false);
    assert.equal(validatePersonName('A', 'Firstname').isValid, false);
    assert.equal(validatePersonName('John123', 'Firstname').isValid, false); // numbers not allowed
    assert.equal(validatePersonName('John <script>', 'Firstname').isValid, false);
    assert.equal(validatePersonName('---', 'Firstname').isValid, false);
});

test('validateEmail', () => {
    // Valid
    assert.equal(validateEmail('teacher@school.org').isValid, true);
    assert.equal(validateEmail('first.last@domain.co.uk').isValid, true);

    // Invalid
    assert.equal(validateEmail('').isValid, false);
    assert.equal(validateEmail('plainaddress').isValid, false);
    assert.equal(validateEmail('@missingusername.com').isValid, false);
    assert.equal(validateEmail('user@.com').isValid, false);
    assert.equal(validateEmail('user@domain').isValid, false);
    assert.equal(validateEmail('<script>@bad.com').isValid, false);
});

test('validatePassword', () => {
    // Valid (8+ chars, upper, lower, digit, special)
    assert.equal(validatePassword('P@ssword123').isValid, true);
    assert.equal(validatePassword('Secure#2026!').isValid, true);

    // Invalid
    assert.equal(validatePassword('weak').isValid, false); // too short
    assert.equal(validatePassword('NoSpecial123').isValid, false); // no special
    assert.equal(validatePassword('nouppercase#1').isValid, false); // no uppercase
    assert.equal(validatePassword('NOLOWERCASE#1').isValid, false); // no lowercase
    assert.equal(validatePassword('NoDigitsHere!').isValid, false); // no digit
});

test('validateDate and validateDateRange', () => {
    assert.equal(validateDate('2026-09-15').isValid, true);
    assert.equal(validateDate('2026-02-28').isValid, true);
    assert.equal(validateDate('2026-02-29').isValid, false); // not leap year
    assert.equal(validateDate('2026-13-01').isValid, false); // invalid month
    assert.equal(validateDate('not-a-date').isValid, false);

    assert.equal(validateDateRange('2026-09-01', '2026-09-15').isValid, true);
    assert.equal(validateDateRange('2026-09-15', '2026-09-01').isValid, false);
});

test('validateTimeDuration', () => {
    assert.equal(validateTimeDuration('09:00 - 10:00').isValid, true);
    assert.equal(validateTimeDuration('14:30 - 15:45').isValid, true);
    assert.equal(validateTimeDuration('10:00 - 09:00').isValid, false); // end before start
    assert.equal(validateTimeDuration('09:00 - 09:00').isValid, false); // equal
    assert.equal(validateTimeDuration('invalid').isValid, false);
});

test('validateId and validateUuid', () => {
    assert.equal(validateId(1).isValid, true);
    assert.equal(validateId('42').isValid, true);
    assert.equal(validateId(0).isValid, false);
    assert.equal(validateId(-5).isValid, false);
    assert.equal(validateId('abc').isValid, false);

    const validUuid = '123e4567-e89b-12d3-a456-426614174000';
    assert.equal(validateUuid(validUuid).isValid, true);
    assert.equal(validateUuid('12ae7874-1b32-4006-b141-d14208b97243').isValid, true);
    assert.equal(validateUuid('invalid-uuid').isValid, false);
    assert.equal(validateUuid(12).isValid, false);
    assert.equal(validateUuid('').isValid, false);
});

test('validateRoomLocation', () => {
    assert.equal(validateRoomLocation('Building A, Floor 2').isValid, true);
    assert.equal(validateRoomLocation('', false).isValid, true);
    assert.equal(validateRoomLocation('', true).isValid, false);
    assert.equal(validateRoomLocation('X', true).isValid, false); // too short
    assert.equal(validateRoomLocation('A'.repeat(101)).isValid, false); // too long
    assert.equal(validateRoomLocation('<script>alert(1)</script>').isValid, false);
});

test('validateRoomFeatures', () => {
    assert.equal(validateRoomFeatures('Projector, Whiteboard, AC').isValid, true);
    assert.equal(validateRoomFeatures('').isValid, true);
    assert.equal(validateRoomFeatures('A'.repeat(501)).isValid, false);
    assert.equal(validateRoomFeatures('<iframe src="evil.com">').isValid, false);
});

test('hasMaliciousContent and sanitizeText', () => {
    assert.equal(hasMaliciousContent('<script>alert("xss")</script>'), true);
    assert.equal(hasMaliciousContent('javascript:void(0)'), true);
    assert.equal(hasMaliciousContent('<img src=x onerror=alert(1)>'), true);
    assert.equal(hasMaliciousContent('Normal text!'), false);

    assert.equal(sanitizeText('  Hello \x00World!  '), 'Hello World!');
    assert.equal(sanitizeText(123), '');
});

test('validateSearchTerm', () => {
    assert.equal(validateSearchTerm('Room 101').isValid, true);
    assert.equal(validateSearchTerm('Room 101').value, 'Room 101');
    assert.equal(validateSearchTerm('<script>bad</script>').isValid, false);
    assert.equal(validateSearchTerm('A'.repeat(120), 100).value.length, 100);
});
