import ProductController from '../controller/product.controller';
// import bindControllerToCRUDRoutes from './helpers';
/**
 * @file index.js is the root file for the example.
 */
const controller = new ProductController();

const router = express.Router();
const joi = BaseJoi.extend(dateFormat);

router.get(
    '/',
    permitRole('uw_admin', 'uw_staff', 'uw_manager', 'company_sale', 'claim_staff'),
    controller.action('list')
);

export default router;
