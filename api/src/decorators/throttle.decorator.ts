import { SetMetadata } from '@nestjs/common';

export const THROTTLE_STRICT_KEY = 'throttle_strict';
export const ThrottleStrict = () => SetMetadata(THROTTLE_STRICT_KEY, true);
