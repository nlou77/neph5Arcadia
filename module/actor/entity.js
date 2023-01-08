import { AbstractRollBuilder } from "../../feature/core/abstractRollBuilder.js";
import { ActiveEffects } from "../../feature/core/effects.js";
import { Arcane } from "../../feature/periode/arcane.js";
import { Aspect } from "../../feature/selenim/aspect.js";
import { Catalyseur } from "../../feature/alchimie/catalyseur.js";
import { Chute } from "../../feature/periode/chute.js";
import { Competence } from "../../feature/periode/competence.js";
import { Constants } from "../common/constants.js";
import { Distance } from "../../feature/combat/core/distance.js";
import { Formule } from "../../feature/alchimie/formule.js";
import { Habitus } from "../../feature/analogie/habitus.js";
import { Game } from "../common/game.js";
import { Invocation } from "../../feature/kabbale/invocation.js";
import { Metamorphe } from "../../feature/nephilim/metamorphe.js";
import { Melee } from "../../feature/combat/core/melee.js";
import { Naturelle } from "../../feature/combat/core/naturelle.js";
import { Ordonnance } from "../../feature/kabbale/ordonnance.js";
import { Materiae } from "../../feature/alchimie/materiae.js";
import { Passe } from "../../feature/periode/passe.js";
import { Periode } from "../../feature/periode/periode.js";
import { Quete } from "../../feature/periode/quete.js";
import { Savoir } from "../../feature/periode/savoir.js";
import { Science } from "../../feature/science/science.js";
import { Vecu } from "../../feature/periode/vecu.js";
import { Sort } from "../../feature/magie/sort.js";
import { Wrestle } from "../../feature/combat/core/wrestle.js";

export class NephilimActor extends Actor {

    /**
     * @returns the system identifier.
     */
    get sid() {
        return this?.system?.id;
    }

    /**
     * @returns true if the actor is desoriente.
     */
    get desoriente() {
        return ActiveEffects.isActive(this, ActiveEffects.DESORIENTE);
    }
    
    /**
     * @returns true if the actor is immobilise.
     */
    get immobilise() {
        return ActiveEffects.isActive(this, ActiveEffects.IMMOBILISE);
    }

    /**
     * @returns true if the actor is projete.
     */
    get projete() {
        return ActiveEffects.isActive(this, ActiveEffects.PROJETE);
    }

    /**
     * @returns the simulacre as actor object, undefined if not exist.
     */
    get simulacre() {
        return game.actors.find(a => a.sid === this.system.simulacre);
    }

    /**
     * @returns the actor damage bonus.
     */
    get dommage() {
        if (this.type === 'figure') {
            if (this.system?.options?.nephilim === true) {
                return Math.floor(this.system.ka.feu / 5);
            } else if (this.system?.options?.selenim === true) {
                return Math.floor(this.system.ka.noyau / 10);
            } else {
                return this.system?.ka.soleil ?? 0;
            }
        } else {
            return 0;
        }
    }

    /**
     * @returns the actor mouvement.
     */
    get mouvement() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return this.system.ka.eau * 2;
                }
                if (this.system.options?.selenim === true) {
                    return this.system.ka.noyau;
                }
                return this.system.ka.soleil ?? 0;
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @returns the actor perspicacite.
     */
    get perspicacite() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return 11 - this.system.ka.air;
                }
                if (this.system.options?.selenim === true) {
                    return 11 - this.system.ka.noyau;
                }
                return 11 - (this.system.ka.soleil ?? 0);
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @returns the actor recuperation.
     */
    get recuperation() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return 11 - this.system.ka.terre;
                }
                if (this.system.options?.selenim === true) {
                    return 11 - this.system.ka.noyau;
                }
                return 11 - this.system.soleil;
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @returns the actor voile.
     */
    get voile() {
        switch (this.type) {
            case 'figure':
                if (this.system.options?.nephilim === true) {
                    return Math.floor(this.system.ka.lune / 5);
                }
                if (this.system.options?.selenim === true) {
                    return Math.floor(this.system.ka.noyau / 10);
                }
                return Math.floor((this.system.ka.soleil ?? 0) / 10);
            case 'figurant':
            default:
                return 0;
        }
    }

    /**
     * @return the initiative.
     */
    get initiative() {
         switch (this.type) {
             case 'figure':
                if (this.system.options?.nephilim === true) {
                    return this.system.ka.eau * 2;
                }
                if (this.system.options?.selenim === true) {
                    return this.system.ka.noyau;
                }
                for (let elt of ['soleil', 'orichalque', 'brume', 'air', 'feu', 'lune', 'terre']) {
                    const val = this.system.ka[elt];
                    if (val !== undefined) {
                        return val;
                    }
                }
            case 'figurant':
                return this.system.menace;
            default:
                return 0;
         }
    }

    /**
     * @returns the voie magique of the actor.
     */
    get voieMagique() {
        return this.items.find(i => i.type === 'magie');
    }

    /**
     * @returns the voie alchimique of the actor.
     */
    get voieAlchimique() {
        return this.items.find(i => i.type === 'alchimie');
    }

    /**
     * @returns true if lutte manoeuver is available for the actor. 
     */
    get isLutteAvailable() {
        return this.type !== 'figure' || this.system.manoeuvres.lutte != null;
    }

    /**
     * @returns true if the lutte manoeuver can be performed.
     */
    get lutteCanBePerformed() {
        if (this.isLutteAvailable === false) {
            return false;
        }
        if (this.tokenOf == null) {
            return true;
        }
        if (this.immobilise) {
            return true;
        }
        return this.target != null;
    }

    /**
     * @returns the data to display. 
     */
    get lutte() {
        if (this.type !== 'figure') {
            return "";
        }
        const sid = this.system.manoeuvres.lutte;
        if (sid == null) {
            return "";
        } else {
            const item = game.items.find(i => i.sid === sid);
            return item == null ? 'System Error' : item.name; 
        }
    }

    /**
     * @returns true if esquive manoeuver is available for the actor. 
     */
    get isEsquiveAvailable() {
        return this.type !== 'figure' || this.system.manoeuvres.esquive != null;
    }

    /**
     * @returns the data to display. 
     */
    get esquive() {
        if (this.type !== 'figure') {
            return "";
        }
        const sid = this.system.manoeuvres.esquive;
        if (sid == null) {
            return "";
        } else {
            const item = game.items.find(i => i.sid === sid);
            return item == null ? 'System Error' : item.name; 
        }
    }

    /**
     * @returns the data to display. 
     */
    get arcanes() {
        return Arcane.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get catalyseurs() {
        return Catalyseur.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get chutes() {
        return Chute.getAll(this);
    }

    /**
     * @returns the current chute
     */
    get khaiba() {
        return Chute.getKhaiba(this);
    }

    /**
     * @returns the current chute
     */
    get narcose() {
        return Chute.getNarcose(this);
    }

    /**
     * @returns the current chute
     */
    get ombre() {
        return Chute.getOmbre(this);
    }

    /**
     * @returns the current chute
     */
    get luneNoire() {
        return Chute.getLuneNoire(this);
    }

    /**
     * @returns the data to display. 
     */
    get competences() {
        return Competence.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get imago() {
        return Aspect.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get metamorphe() {
        return Metamorphe.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get ordonnances() {
        return Ordonnance.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get materiae() {
        return Materiae.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get passes() {
        return Passe.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get periodes() {
        return Periode.getAll(this);
    }

    /**
     * @returns the name of the current periode.
     */
    get currentPeriode() {
        if (this.system.periode == null) {
            return "Aucune periode courante";
        }
        const periode = game.items.find(i => i.sid === this.system.periode);
        return periode == null ? "Periode non trouvee" : periode.name;
    }

    /**
     * @returns the true if no periodes. 
     */
    get noPeriodes() {
        return Periode.getAll(this).length === 0;
    }

    /**
     * @returns the data to display. 
     */
    get quetes() {
        return Quete.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get savoirs() {
        return Savoir.getAll(this);
    }

    /**
     * @returns the data to display. 
     */
    get vecusOfActor() {
        return Vecu.getAll(this, 'actor');
    }

    /**
     * @returns the data to display. 
     */
    get vecusOfSimulacre() {
        return Vecu.getAll(this, 'simulacre');
    }

    /**
     * @returns the only targeted token identifier. 
     */
    get target() {
        const targets = Array.from(game.user.targets);
        return targets.length === 0 || targets.length > 1 ? null : targets[0];
    }

    /**
     * @returns the token of the actor on the scene, null if none
     */
    get tokenOf() {
        if (this.token != null) {
            return this.token;
        }
        return canvas.tokens?.objects?.children.find(t => t.actor.id === this.id);
    }

    /**
     * @param sciences The name of the sciences.
     * @returns true if at least a science must be displayed.
     */
    displaySciences(sciences) {
        for (let science of sciences) {
            if (this.displayScience(science)) {
                return true;
            }
        }
        return false;
    }

    /**
     * @param science The name of the science.
     * @returns true if science must be displayed.
     */
    displayScience(science) {
        return this.science(science) > 0 || this.focus(science).length > 0;
    }

    /**
     * @param science The key of the science.
     * @returns the level of the science.
     */
    science(science) {
        const i = Science.getScience(science);
        return new Science(this, i).degre;
    }

    /**
     * @param science The name of the science.
     * @returns the owned focus of the actor. 
     */
    focus(science) {

        let type = null;
        let property = null;
        switch(science) {
            case 'basseMagie':
            case 'hauteMagie':
            case 'grandSecret':
                type = 'sort';
                property = 'cercle';
                break;
            case 'comprendre':
            case 'controler':
            case 'creer':
            case 'detruire':
            case 'transformer':
                type = 'habitus';
                property = 'domaine';
                break;

            case 'malkut':
            case 'yesod':
            case 'hod':
            case 'netzach':
            case 'tiphereth':
            case 'geburah':
            case 'chesed':
            case 'binah':
            case 'chokmah':
            case 'kether':
                type = 'invocation';
                property = 'sephirah';
                break;
            case 'oeuvreAuNoir':
            case 'oeuvreAuBlanc':
            case 'oeuvreAuRouge':
                type = 'formule';
                property = 'cercle';
                break;
            case 'fossoyeur':
            case 'embaumeur':
            case 'imputrescible':
                type = 'rite';
                property = 'cercle';
                break;
            case 'charmeur':
            case 'dresseur':
            case 'demiurge':
                type = 'appel';
                property = 'cercle';
                break;
            default:
                if (typeof science === 'string' && science?.substring(0,9) === 'analogie@') {
                    type = 'habitus';
                    property = 'domaine';
                }
        }

        let items = [];
        const ids = this.items.filter(i => i.type === type && new Periode(this, this.items.find(j => j.sid === i.system.periode)).actif()).map(i => i.sid);
        for (let item of game.items.filter(i => i.system[property] === science && ids.includes(i.sid))) {

            let degre = null;
            switch (item.type) {
                case 'sort':
                    degre = new Sort(this, item).withPeriode(this.system.periode).degre;
                    break;
                case 'habitus':
                    degre = new Habitus(this, item).withPeriode(this.system.periode).degre;
                    break;
                case 'invocation':
                    degre = new Invocation(this, item).withPeriode(this.system.periode).degre;
                    break;
                case 'formule':
                    degre = new Formule(this, item).withPeriode(this.system.periode).degre;
                    break;
            }

            const embedded = this.items.find(i => i.sid === item.sid);
            if (degre != null) {
                embedded.degre = degre * 10;
            }

            items.push({
                original: item,
                embedded: embedded
            });

        }
        return items;

    }

    /**
     * @param type The type of dammages, 'physique', or 'magique'.
     * @returns the protection against the specified type of dammage according to
     * the armor if exists and the optional bonus.
     */
    protection(type) {

        // Initialization
        let protection = this.system.bonus.protection;

        // Add the armor if exists
        const armor = this.items.find(i => i.type === "armure" && i.system.used === true);
        if (armor != null) {
            protection = protection + armor.system[type];
        }

        return protection;
    }

     /**
     * Create the specified feature.
     * @param type The purpose 
     *   - arcane
     *   - chute
     *   - competence
     *   - ka 
     *      * element [air, eau, feu, lune, terre, soleil, ka]
     *   - noyau
     *   - passe
     *   - pavane
     *   - quete
     *   - savoir
     *   - science
     *   - vecu
     * @param id The object identifier
     * @param 
     * @returns the instance.
     */
    async processMacro(type, id, sid) {
        let builder = null;
        switch (type) {
            case 'appel':
            case 'chute':
            case 'competence':
            case 'formule':
            case 'invocation':
            case 'quete':
            case 'passe':
            case 'rite':
            case 'savoir':
            case 'sort': {
                const item = game.items.find(i => i.sid === sid);
                builder = new AbstractRollBuilder(this)
                    .withItem(item)
                    .withScope('actor')
                    .withPeriode(this.system.periode);
                break;
            }
            case 'vecu': {
                const item = this.items.find(i => i.id === id);
                builder = new AbstractRollBuilder(this)
                    .withItem(item)
                    .withScope('actor')
                    .withPeriode(this.system.periode);
                break;
            }
            case 'ka': {
                builder = new AbstractRollBuilder(this)
                    .withKa(id)
                    .withScope('actor');
                break;
            }
            case 'noyau': {
                builder = new AbstractRollBuilder(this)
                    .withNoyau();
                break;
            }
            case 'pavane': {
                builder = new AbstractRollBuilder(this)
                    .withPavane();
                break;
            }
            case 'weapon-attack': {
                const weapon = this.items.get(id);
                if (weapon.attackCanBePerformed === false) {
                    ui.notifications.warn("Vous ne pouvez pas attaquer avec cette arme.");
                    return;
                }
                switch (weapon.system.type) {
                    case Constants.NATURELLE:
                        await new Naturelle(this, weapon).initialize();
                        break;
                    case Constants.MELEE:
                        await new Melee(this, weapon).initialize();
                        break;
                    case Constants.FEU:
                    case Constants.TRAIT:
                        await new Distance(this, weapon).initialize();
                        break;
                }
                break;
            }
            case 'lutte': {
                if (this.lutteCanBePerformed) {
                    await new Wrestle(this).initialize();
                }
                break;
            }
        }
        const feature = builder.create();
        if (feature != null) {
            await feature.initialize();
        }
    }

    async updateEffect(id) {
        await ActiveEffects.toggle(this, ActiveEffects.get(id));
    }

    async activateEffect(id) {
        await ActiveEffects.activate(this, ActiveEffects.get(id));
    }

    async deactivateEffect(id) {
        await ActiveEffects.deactivate(this, ActiveEffects.get(id));
    }

    /**
     * Use or unused the specified item.
     * @param item The item to modify.
     */
    async useItem(item) {
        const used = item.system.used;
        await item.update({ ['system.used']: !used });
    }

    /**
     * Use the specified item as defense weapon or not.
     * @param item The item object used for defense.
     */
    async toggleDefenseWeapon(item) {
        const parade = item.system.parade;
        await item.update({ ['system.parade']: !parade });
        for (let arme of this.items.filter(i => i.type === 'arme' && i.id !== item.id)) {
            await arme.update({ ['system.parade']: false });
        }
    }

    // ----------------------------------------------------------------------------------------------

    /**
     * Gets the construct associated with the specified substance.
     * @param substance The substance of the construct to get.
     * @return the construct.
     */
    getConstruct(substance) {
        const constructs = this.system.alchimie.constructs;
        switch (substance) {
            case 'ambre':
                return constructs.cornue;
            case 'liqueur':
                return constructs.alambic;
            case 'metal':
                return constructs.creuset;
            case 'poudre':
                return constructs.athanor;
            case 'vapeur':
                return constructs.aludel;
        }
    }

    /**
     * @returns the allowed approches with the name of the element and the value if > 0.
     */
    approches() {
        const approches = {};
        approches['none'] = {
            name: 'NEPH5E.none',
            label: 'Aucune approche',
            degre: 0
        };
        switch (this.type) {
            case 'figure':
                if (this.system.options.selenim === true) {
                    if (this.system.ka.noyau > 0) {
                        approches['noyau'] = {
                            name: 'NEPH5E.luneNoire',
                            label: 'Approche de ' + game.i18n.localize('NEPH5E.luneNoire'),
                            degre: this.system.ka.noyau
                        };
                    }
                }
                if (this.system.options.nephilim === true) {
                    for (let elt of ['air', 'eau', 'feu', 'lune', 'terre']) {
                        const value = this.system.ka[elt];
                        if (value > 0) {
                            approches[elt] = {
                                name: 'NEPH5E.pentacle.elements.' + elt,
                                label: 'Approche de ' + game.i18n.localize('NEPH5E.pentacle.elements.' + elt),
                                degre: value
                            };
                        }
                    }
                }
                break;
            case 'figurant':
                approches['ka'] = {
                    name: 'NEPH5E.ka',
                    label: 'Approche de ' + game.i18n.localize('NEPH5E.ka'),
                    degre: this.system.ka
                };
                break;
        }
        return approches;
    }

    /**
     * Gets the level of the specified ka.
     * @param element The element of the ka to get. Allowed ka are:
     *   air,
     *   brume,
     *   eau,
     *   feu,
     *   lune,
     *   noyau,
     *   orichalque,
     *   reserve,
     *   soleil,
     *   terre
     * @returns the level of the specified ka.
     */
    getKa(element) {
        switch (this.type) {
            case 'figure':
                return this.system.ka[element] ?? 0;
            case 'figurant':
                return this.system.ka;
        }
    }

    /**
     * @returns the wounds modifier.
     */
    getWoundsModifier(type) {
        let modifier = 0;
        const baseDommage = type === Constants.PHYSICAL ? this.system.dommage.physique : this.system.dommage.magique;
        for (const w in Game.wounds) {
            const wound = Game.wounds[w];
            if (baseDommage[wound.id]) {
                modifier = modifier + wound.modifier;
            }
        }
        return modifier;
    }

    getSentence(quality, self) {
        return self ? game.i18n.localize('NEPH5E.tente.self.' + quality) : game.i18n.localize('NEPH5E.tente.simulacre.' + quality);
    }

    /**
     * Deletes the specified competence.
     * @param item The competence item object to delete.
     */
    async deleteCompetence(item) {

        // Update embedded vecus
        for (let o of this.items.filter(i => i.type === 'vecu')) {
            const competences = o.system.competences.filter(i => i !== item.sid);
            await o.update({ ['system.competences']: competences });
        }

        // Delete embedded weapons which use the competence
        for (let o of this.items.filter(i => i.type === 'arme')) {
            if (o.system?.competence === item.sid) {
                await this.deleteEmbeddedDocuments('Item', [o.id]);
            }
        }

        // Update actor manoeuvres
        if (this.type === 'figure') {
            const system = duplicate(this.system);
            if (system.manoeuvres.esquive === item.sid) {
                system.manoeuvres.esquive = null;
            }
            if (system.manoeuvres.lutte === item.sid) {
                system.manoeuvres.lutte = null;
            }
            await this.update({['system']: system});
        }

        // Render the sheet if opened.
        await this.render();

    }

    /**
     * Deletes the specified periode.
     * @param item The item to delete.
     */
    async deletePeriode(item) {

        // Update actor data
        if (this.type === 'figure') {

            // Remove the specified embedded item
            const next = this.items.find(i => (i.type === 'periode' && i.system.previous === item.sid));
            if (next != null) {
                const del = this.items.find(i => i.sid === item.sid);
                await next.update({ ["system.previous"]: del.system.previous });
            }

            // Remove the current periode if necessary
            if (this.system.periode === item.sid) {
                await this.setCurrentPeriode(null);
            }
        }

        // Update embedded items
        for (let embedded of this.items.filter(i => i.system.periode === item.sid)) {
            await this.deleteEmbeddedDocuments('Item', [embedded.id]);
        }

        // Render the sheet if opened.
        await this.render();

    }
 
    /**
     * @param sid The system identifier of current periode to set.
     * @returns the instance.
     */
    async setCurrentPeriode(sid) {
        await this.update({ ["system.periode"]: sid });
    }

    /**
     * Deletes the specified periode.
     * @param item The item to delete.
     */
    async deleteVecu(item) {

        // Update embedded items
        for (let v of this.items.filter(o => o.type === 'vecu' && o.system.periode === item.system.periode)) {
            await this.deleteEmbeddedDocuments('Item', [v.id]);
        }

        // Delete embedded weapons which use the vecu
        for (let o of this.items.filter(i => i.type === 'arme' && i.system?.competence === item.sid)) {
            await this.deleteEmbeddedDocuments('Item', [o.id]);
        }

        // Update actor manoeuvres
        if (this.type === 'figure') {
            const system = duplicate(this.system);
            if (system.manoeuvres.esquive === item.sid) {
                system.manoeuvres.esquive = null;
            }
            if (system.manoeuvres.lutte === item.sid) {
                system.manoeuvres.lutte = null;
            }
            await this.update({['system']: system});
        }

        // Render the sheet if opened.
        await this.render();

    }

    /**
     * @Override
     */
     async _onDelete(options, userId) {

        // On process world actor deletion
        if (this.isEmbedded === true) {
            return;
        }

        // Delete simulacre
        for (let actor of game.actors) {
            if (actor.system?.simulacre === this.sid) {
                await actor.update({ ['system.simulacre']: null });
            }
        }
        for (let scene of game.scenes) {
            for (let token of scene.tokens) {
                if (token.actor != null) {
                    if (token.actor.system?.simulacre === this.sid) {
                        await token.actor.update({ ['system.simulacre']: null });
                    }
                }
            }
        }

        await super._onDelete(options, userId);

    }

    /**
     * Render the sheet if opened.
     */
    async render() {
        if (this?.sheet?.rendered === true) {
            await this.sheet.render(true);
        }
    }

}