import { AbstractFocus } from "../core/abstractFocus.js";
import { ActionDataBuilder } from "../core/actionDataBuilder.js";
import { Constants } from "../../module/common/constants.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";

export class Tekhne extends AbstractFocus {

    /**
     * @Override
     */
    get title() {
        return "Jet de Tekhné Rosicrucienne";
    }

    /**
     * @Override
     */
    get sentence() {
        return 'NEPH5E.tente.self.tekhne';
    }

    /**
     * @Override
     */
    get data() {
        return new ActionDataBuilder(this)
            .withType(Constants.SIMPLE)
            .withItem(this.item)
            .withBase('Tekhné', this.degre)
            .withBlessures('magique')
            .export();
    }

    /**
     * @Override
     */
    get rawDegre() {

        // Retrieve the degre of the ka used to cast the focus
        const ka = this.actor.getKa('soleil');
        if (ka < 1) {
            return -115;
        }

        const savoir = this.actor.savoir("coupe").degre;
        if (savoir < 1) {
            return -117;
        }

        // Retrieve the degre of the focus to cast
        const focus = this.item.system.degre;

        return savoir + ka - focus;

    }

    /**
     * @Override
     */
    async _createEmbeddedItem(previous) {

        // Create a new focus or move the focus to the new periode.
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a tekhne")
            .withDeleteExisting()
            .withData("periode", this.periode)
            .withoutData('description', 'cercle', 'degre')
            .create();

    }

    /**
     * @Override
     */
    getEmbeddedData() {
        return {
            difficulty: this.degre
        }
    }

}