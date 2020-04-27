import { ResourceNotFoundError } from 'firis-service-sdk-test2/errors/BusinessErrors';
import db from '../models';
import BaseService from './base.services';
import TranslationService from './translation.service';
import ProductBenefitService from './productBenefit.service';
import ProductPlanService from './productPlan.service';
/**@namespace */
class ProductService extends BaseService {
    /**
     * list - List all objects in the database
     * @param  {Object} [filter] req  Express request object
     * @returns {object[]}
     */
    static listProducts(filter) {
        const search = !filter.search ? '%%' : `%${filter.search}%`;
        let languageCondition = {};
        if (filter.language) {
            languageCondition = {
                where: {
                    $or: [
                        { '$translations.language$': filter.language },
                        { '$translations.language$': { $eq: null } }
                    ]
                }
            };
        }
        return db.Product.findAndCountAll({
            distinct: true,
            include: [
                {
                    model: db.ProductTranslation,
                    as: 'translations',
                    required: false,
                    ...languageCondition
                },
                {
                    model: db.ProductEligibility,
                    as: 'eligibility'
                }
            ],
            where: {
                $or: [
                    { '$translations.name$': { $iLike: search } },
                    { '$translations.term$': { $iLike: search } },
                    { '$translations.clause$': { $iLike: search } },
                    { code: { $iLike: search } }
                ],
                tenant_id: `${filter.tenant_id}`
            },
            order: [
                ['created_at', 'DESC']
            ],
            limit: filter.limit,
            offset: filter.offset,
            subQuery: false
        });
    }

    static findProduct({ id, tenant_id, config = {} }) {
        return db.Product.findOne({
            include: [
                {
                    model: db.ProductTranslation,
                    as: 'translations'
                },
                {
                    model: db.ProductEligibility,
                    as: 'eligibility',
                    required: false
                },
                {
                    model: db.ProductBenefit,
                    as: 'benefits'
                },
                {
                    model: db.ProductPlan,
                    as: 'plans'
                }
            ],
            where: { id, tenant_id },
            ...config
        }).then(item => {
            if (!item) throw new ResourceNotFoundError('Product');
            return item;
        });
    }

    static addEligibilityInfo(data) {
        const formated = data;
        formated.eligibility = {
            min_premiums: 0,
            min_age: 0,
            max_age: 0
        };
        return formated;
    }

    static addProduct(data) {
        const formatedTranslation = TranslationService.formatTranslation(data);
        const formated = ProductService.addEligibilityInfo(formatedTranslation);
        if (!formated.settings) {
            formated.settings = {
                defaultLanguage: 'en-US',
                certificate_template_id: '',
                autoCreateBill: 'Default'
            };
        }
        return db.Product.create(formated, {
            include: [
                {
                    model: db.ProductTranslation,
                    as: 'translations'
                },
                {
                    model: db.ProductEligibility,
                    as: 'eligibility'
                }
            ]
        });
    }

    static updateProduct({ id, tenant_id, ...data }) {
        let config = {};
        if (!Array.isArray(data.translations)) {
            config = { include: [] };
        }
        return ProductService.findProduct({ id, tenant_id, config })
            .then((product) => db.sequelize.transaction(transaction => {
                const promiseArray = [];
                if (data.type !== undefined) {
                    if (product.type !== data.type) {
                        for (let i = 0; i < product.benefits.length; i += 1) {
                            promiseArray.push(ProductBenefitService.deleteProductBenefit({
                                id: product.benefits[i].id,
                                tenant_id,
                                transaction
                            }));
                        }
                        for (let i = 0; i < product.plans.length; i += 1) {
                            promiseArray.push(ProductPlanService.deleteProductPlan({
                                id: product.plans[i].id,
                                tenant_id,
                                transaction
                            }));
                        }
                    }
                }
                promiseArray.push(TranslationService.updateTranslation({
                    data,
                    model: product,
                    translationModel: db.ProductTranslation,
                    foreignKey: 'product_id',
                    transaction
                }));
                promiseArray.push(product.updateAttributes(data, transaction));
                return Promise.all(promiseArray);
            }));
    }

    static deleteProduct({ id, tenant_id }) {
        return db.sequelize.transaction((t) => db.Product.destroy(
            { where: { id, tenant_id }, individualHooks: true },
            { transaction: t }
        ));
    }

}

export default ProductService;
