/*:
 * @plugindesc 修改战斗信息
 * @author Hale Lin
 *
 * @param frameCount
 * @text
 * @type number
 * @desc 停留帧数
 * @default 20
 *
 */

(() => {
    const params_bmc = PluginManager.parameters('BattleMsgController');
    Window_BattleLog.prototype.messageSpeed = function() {
        // return 16;
        return params_bmc['frameCount'];
    };
    /*
    * 提示谁行动的箭头
    * */
    Window_BattleStatus.prototype.drawArrow = function(x, y) {
        if (this._arrowSprite) {
            this.removeChild(this._arrowSprite);
            this._arrowSprite.destroy()
            this._arrowSprite = null;
        }
        var bitmap = ImageManager.loadExPic("Arrow");
        this._arrowSprite = new Sprite(bitmap);
        this._arrowSprite.move(x, y);
        this.addChild(this._arrowSprite);
    };


    Window_BattleStatus.prototype.select = function (index) {
        this._index = index;
        if (this._cursorAll) {
            this.refreshCursorForAll();
        } else if (this.index() >= 0) {
            //主要改这部分
            const rect = this.itemRect(this.index());
            const rect2 = this.faceRect(index);
            this.drawArrow(rect2.x + 5, rect2.y + 5);
            this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
        } else {
            this.setCursorRect(0, 0, 0, 0);
            if (this._arrowSprite) {
                console.log("arrow:", this._arrowSprite)
                this.removeChild(this._arrowSprite);
                this._arrowSprite.destroy();
                this._arrowSprite = null;
            }
        }
        this.callUpdateHelp();
    }

    var _Window_BattleStatus_initialize =  Window_BattleStatus.prototype.initialize;
    Window_BattleStatus.prototype.initialize = function(rect) {
        _Window_BattleStatus_initialize.call(this, rect)
        this._arrowSprite = null;
    };

    /*
    * 人物状态分布显示
    * */
    Window_BattleStatus.prototype.myDrawIcon = function (key, index, x, y) {

        console.log(index);
        const mySprite = this.createInnerSprite(key+index, Sprite)
        const pw = ImageManager.iconWidth;
        const ph = ImageManager.iconHeight;
        const sx = (index % 16) * pw;
        const sy = Math.floor(index / 16) * ph;
        mySprite.bitmap = ImageManager.loadSystem("IconSet");
        mySprite.setFrame(0,0,0,0);
        mySprite.setFrame(sx, sy, pw, ph);
        return mySprite
    }
    Window_BattleStatus.prototype.placeStateIcon = function (actor, x, y) {
        const key = "actor%1-stateIcon".format(actor.actorId());
        // const sprite = this.createInnerSprite(key, Sprite_StateIcon);
        const icons = actor.states();
        const iconWidth = ImageManager.iconWidth;
        const iconHeight = ImageManager.iconHeight;
        x -= iconWidth * 1.5;
        y -= iconWidth / 2;
        for (let i = 0; i < icons.length; i++) {
            let iconSprite = this.myDrawIcon(key, icons[i].iconIndex, x, y);
            iconSprite.move(x, y);
            iconSprite.show();
            x += iconWidth;
            if (i + 1 < icons.length) {
                i++;
            }
            else {
                break;
            }
            iconSprite = this.myDrawIcon(key, icons[i].iconIndex, x, y);
            iconSprite.move(x, y);
            iconSprite.show();
            x -= iconWidth;
            y += iconHeight;
        }

    }

    var _Window_BattleStatus_update = Window_BattleStatus.prototype.update
    Window_BattleStatus.prototype.update = function() {
        _Window_BattleStatus_update.call(this)
        let flag = false
        for (const actor of $gameParty.members()) {
            if (actor._actionState === "inputting") {
                flag = true
            }
        }
        if (flag){
            for (let i = 0; i < $gameParty.members().length; i++) {
                const actor = $gameParty.members()[i];
                const rect = this.itemRectWithPadding(i);
                const stateIconX = this.stateIconX(rect);
                const stateIconY = this.stateIconY(rect);
                const key = "actor%1-stateIcon".format(actor.actorId());
                for (const k in this._additionalSprites) {
                    if (k.startsWith(key)) {
                        const sprite = this._additionalSprites[k];
                        delete this._additionalSprites[k];
                        sprite.destroy();
                    }
                }
                this.placeStateIcon(actor,stateIconX,stateIconY);
            }
        }
    };

    // Game_Battler.prototype.addState = function(stateId) {
    //     if (this.isStateAddable(stateId)) {
    //         if (!this.isStateAffected(stateId)) {
    //             this.addNewState(stateId);
    //             this.refresh();
    //         }
    //         this.resetStateCounts(stateId);
    //         this._result.pushAddedState(stateId);
    //
    //         this._stateChanged = true
    //     }
    // };
    //
    // Game_Battler.prototype.removeState = function(stateId) {
    //     if (this.isStateAffected(stateId)) {
    //         if (stateId === this.deathStateId()) {
    //             this.revive();
    //         }
    //         this.eraseState(stateId);
    //         this.refresh();
    //         this._result.pushRemovedState(stateId);
    //
    //         this._stateChanged = true
    //     }
    // };
})()