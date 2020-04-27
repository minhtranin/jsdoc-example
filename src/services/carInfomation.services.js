import sequelize from 'sequelize';
import BaseService from './base.services';
import CarInfomationDb from '../models/carInfomation';

class CarInfomationService extends BaseService {
    static async getCarModels() {
        const allModelCar = await CarInfomationDb.CarInfomation.findAll({
            order: [['DONG_XE', 'ASC']],
            raw: true,
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('ID_DONG_XE')), 'id'], ['DONG_XE', 'name'], ['ID_HANG_XE', 'brand_id']]
        });
        // eslint-disable-next-line arrow-body-style
        const transformCarModel = allModelCar.map((carInfo) => {
            return {
                id: carInfo.id.substring(carInfo.id.indexOf('-') + 1),
                name: carInfo.name,
                brand_id: carInfo.brand_id
            };
        });
        return transformCarModel;
    }

    static async getCarBrands() {
        return CarInfomationDb.CarInfomation.findAll({
            order: [['HANG_XE', 'ASC']],
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('ID_HANG_XE')), 'id'], ['HANG_XE', 'name']]
        });
    }
}

export default CarInfomationService;
