import { Router } from 'express';

import { roomsController } from '../controller/rooms.controller';
import {
  createRoomSchema,
  joinRoomSchema,
  roomCodeParamSchema,
  leaveRoomSchema,
} from '../validations/rooms.validation';
import { authenticate, validate } from '../../../app/middlewares';
import { asyncHandler } from '../../../shared/utils/asyncHandler';

export const roomsRouter = Router();

roomsRouter.use(authenticate);

roomsRouter.post('/', validate({ body: createRoomSchema }), asyncHandler(roomsController.create));
roomsRouter.post('/join', validate({ body: joinRoomSchema }), asyncHandler(roomsController.join));
roomsRouter.post(
  '/leave',
  validate({ body: leaveRoomSchema }),
  asyncHandler(roomsController.leave),
);
roomsRouter.get(
  '/:code',
  validate({ params: roomCodeParamSchema }),
  asyncHandler(roomsController.get),
);
