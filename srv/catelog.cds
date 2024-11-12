using {kharcha as db} from '../db/schema';

service kharcha_service {
    entity Category as projection on db.Category;
    entity Month    as projection on db.Month;
    entity Item     as projection on db.Item;
    function generatePDF(month_name:String,year:String) returns String;
}
