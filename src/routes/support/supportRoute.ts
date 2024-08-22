import { Router } from 'express';
import { createSupportTicket, getSupportTicketById, getAllSupportTickets,  updateTicketStatus, sendMessage, uploadsupportimg } from '../../controllers/support/supportcontroller'; 
import { isAuth } from '../../middlewares/auth';

const router = Router();


router.post('/createSupportTicket', isAuth, uploadsupportimg.single('image'), createSupportTicket);

router.get("/getSupportTicketById/:id", isAuth, getSupportTicketById);

router.post('/getAllSupportTickets', isAuth, getAllSupportTickets);

router.patch('/sendmessage/:id', isAuth, uploadsupportimg.single('chatimage'), sendMessage);

router.patch("/updateTicketStatus/:id", isAuth, updateTicketStatus);

export default router;
