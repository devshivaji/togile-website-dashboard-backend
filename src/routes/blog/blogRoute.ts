import { Request, Response,NextFunction, Router } from 'express';
import {
  createBlog,
  getBlogById,
  getAllBlogs,
  updateBlog,
  deleteBlogById,
  uploadblogimg,
  checkSlug,
  getAllBlogData,
  getBlogBySlug,

} from '../../controllers/blog/blogcontroller';
import { isAuth } from '../../middlewares/auth';

// const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
//   console.log("Middleware is being executed");
//   next();
// };

const router = Router();

router.post('/createBlog' , isAuth,  uploadblogimg.single('thumbnails'),createBlog);

router.patch('/updateBlog/:id',isAuth, uploadblogimg.single('thumbnails'),updateBlog);

router.get('/getBlogById/:id', isAuth, getBlogById);

router.post('/getAllBlogs',isAuth, getAllBlogs);

router.delete('/deleteBlogById/:id', isAuth, deleteBlogById);

router.get('/checkSlug/:slug',  checkSlug);

router.get('/getAllBlogData', getAllBlogData);

router.get('/getAllBlogData/:slug', getBlogBySlug);

export default router;