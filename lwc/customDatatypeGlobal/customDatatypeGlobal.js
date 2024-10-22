import LightningDatatable from 'lightning/datatable';
import toggleButtonColumnTemplate from './toggleButtonColumnTemplate.html';
import customPicklistTemplate from './customPicklist.html';
import customPicklistEditTemplate from './customPicklistEdit.html';

export default class CustomDatatypeGlobal extends LightningDatatable {
    static customTypes = {
        customPicklist: {
            template: customPicklistTemplate,
            editTemplate: customPicklistEditTemplate,
            standardCellLayout: true,
            typeAttributes: ['value', 'options', 'context']
        },
        toggleButton: {
            template: toggleButtonColumnTemplate,
            standardCellLayout: true,
            typeAttributes: ['buttonDisabled', 'rowId', 'fieldApiName'],
        }
    }
}