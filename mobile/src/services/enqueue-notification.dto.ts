export class EnqueueNotificationDto {
  userId!: string;
  title!: string;
  body!: string;
  data?: Record<string, any>;
}