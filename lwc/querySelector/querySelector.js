import { LightningElement } from 'lwc';

export default class QuerySelector extends LightningElement {

    handleClick(event){

        const res = this.template.querySelector('h1');
        res.innerText = 'heelo';

        const div = this.template.querySelector('.name');
        div.style.border = "1px solid red";
    }

}