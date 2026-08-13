
import { IsEnum } from 'class-validator';

export enum InstructorApprovalStatus {
  ACCEPT = "accept",
  REJECT = "reject",
}

export class ApproavedInstructorStatusQuery {
  @IsEnum(InstructorApprovalStatus, {
    message: "Status must be either 'accept' or 'reject'",
  })
  status: InstructorApprovalStatus;
}
