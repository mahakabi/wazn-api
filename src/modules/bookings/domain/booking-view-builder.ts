import { PhoneNumber } from '../../../common/domain/phone-number';
import { type BookingRecord, type StaffBookingRecord } from './booking-record';
import { effectiveStatus } from './booking-status';
import {
  type BookingPlaceView,
  type MemberBookingView,
  type StaffBookingView,
} from './booking-views';

function placeView(record: BookingRecord): BookingPlaceView {
  return {
    branchId: record.place.branchId,
    district: record.place.district,
    gymNameEn: record.place.gymNameEn,
    gymNameAr: record.place.gymNameAr,
  };
}

function maskPhone(phone: string | null): string | null {
  if (phone === null) return null;
  try {
    return PhoneNumber.parse(phone).masked;
  } catch {
    return null;
  }
}

export function toMemberBookingView(record: BookingRecord, now: Date): MemberBookingView {
  return {
    id: record.id,
    code: record.code,
    qrPayload: record.code,
    status: effectiveStatus(record, now),
    lockedPrice: record.lockedPrice,
    offerApplied: record.offerId !== null,
    planId: record.planId,
    planMonths: record.planMonths,
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
    confirmedAt: record.confirmedAt,
    place: placeView(record),
  };
}

export function toStaffBookingView(record: StaffBookingRecord, now: Date): StaffBookingView {
  return {
    id: record.id,
    code: record.code,
    status: effectiveStatus(record, now),
    lockedPrice: record.lockedPrice,
    planMonths: record.planMonths,
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
    confirmedAt: record.confirmedAt,
    memberFirstName: record.memberFirstName,
    memberMaskedPhone: maskPhone(record.memberPhone),
    place: placeView(record),
  };
}
