import ProductService from '../services/product.services';

/**@namespace*/

class ProductController extends CRUD {
    /**
     * list - List all objects in the database
     * {@link ProductService}
     * @param  {Object} req  Express request object
     * @param  {Object} res  Express response object
     * @param  {Function} next Express next middleware function
     * @return {*} The value of the property.
     * @author minhtran
     */
    list(req, res) {
        const userData = res.locals.user;
        return ProductService.listProducts({
            ...req.query,
            search: req.query.search || '',
            tenant_id: userData.account.tenant_id
        });
    }

    /**
 * retrieve - Retrieves a single item by ID.
 *
 * @param  {Object} req  Express request object
 * @param  {Object} res  Express response object
 * @param  {Function} next Express next middleware function
 * @return {*} The value of the property.
 */
    retrieve(req, res) {
        const userData = res.locals.user;
        return ProductService.findProduct({
            id: req.params.id,
            tenant_id: userData.account.tenant_id
        });
    }

    /**
     * create - creates a new entity.
     *
     * @param  {Object} req  Express request object
     * @param  {Object} res  Express response object
     * @param  {Function} next Express next middleware function
     * @return {object[]} The value of the property.
     */
    create(req, res) {
        const userData = res.locals.user;
        const productData = {
            ...req.body,
            tenant_id: userData.account.tenant_id,
            created_by: userData.account.id
        };
        return ProductService.addProduct(productData);
    }

    /**
     * update - Updates a single item given ID and that it exists.
     *
     * @param  {Object} req  Express request object
     * @param  {Object} res  Express response object
     * @param  {Function} next Express next middleware function
     * @return {*} The value of the property.
     */
    update(req, res) {
        const userData = res.locals.user;
        const productData = {
            ...req.body,
            id: req.params.id,
            tenant_id: userData.account.tenant_id
        };
        return ProductService.updateProduct(productData);
    }

    /**
     * destroy - Deletes an item given id and that the item exists
     *
     * @param  {Object} req  Express request object
     * @param  {Object} res  Express response object
     * @param  {Function} next Express next middleware function
     * @return {*} The value of the property.
     */
    destroy(req, res) {
        const userData = res.locals.user;
        return ProductService.deleteProduct({
            id: req.params.id,
            tenant_id: userData.account.tenant_id
        })
            .then(count => ({ count }));
    }
}

export default ProductController;
