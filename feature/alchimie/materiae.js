import { AbstractFeature } from "../core/AbstractFeature.js";
import { EmbeddedItem } from "../../module/common/embeddedItem.js";
import { Game } from "../../module/common/game.js";

export class Materiae extends AbstractFeature {

    /**
     * Constructor.
     * @param actor The actor which performs the action.
     * @param item  The embedded item object, purpose of the action. 
     */
    constructor(actor, item) {
        super(actor);
        this.item = item;
    }

    /**
     * @Override
     */
    async drop() {
        await new EmbeddedItem(this.actor, this.sid)
            .withContext("Drop of a materiae")
            .withData("quantite", 0)
            .withoutData('description', 'element')
            .create();
    }

    /**
     * @Override
     */
    async delete() {
        await this.deleteEmbeddedItem(this.sid);
        return this;
    }

    /**
     * @Override
     */
    async edit() {
        await super.edit(
            "systems/neph5e/feature/alchimie/item/materiae.html",
            {
                item: game.items.get(this.item._id),
                system: this.item.system,
                elements: Game.pentacle.elements,
                debug: game.settings.get('neph5e', 'debug'),
                readOnly: true
            },
            'ITEM.TypeMateriae',
            560,
            500
        )
    }

    /**
     * @returns the data used to display the actor item.
     */
     static getAll(actor) {
        let items = [];
        for (let item of AbstractFeature.items(actor,'materiae')) {
            items.push({
                original: {
                    id: item.original.id,
                    name: item.original.name,
                    element: item.original.system.element
                },
                embedded: {
                    id: item.embedded.id,
                    quantite: item.embedded.system.quantite
                }
            });
        }
        return items;

    }

}