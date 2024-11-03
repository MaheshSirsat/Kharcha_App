namespace kharcha;
using {kharcha.Types as dbType} from '../db/assertType';
using {cuid,managed} from '@sap/cds/common';

entity Month:managed{
    key month_name :String(20) @mandatory;
    key year:String @mandatory;
    previous_Balance:Integer default 0;
    credit_Balance:Integer @mandatory;
    total_Balance:Integer;
    to_Items:Composition of many Item on to_Items.to_Month=$self;
}

entity Item : cuid,managed {
    name:String @mandatory;
    remarks:String;
    amount:Integer;
    to_Category:Association to Category; 
    to_Month:Association to Month;
}
entity Category:managed{
    key name:String @mandatory;
    status:dbType.category_status default 'Approved';
    to_Item:Association to many Item on to_Item.to_Category=$self;
}


