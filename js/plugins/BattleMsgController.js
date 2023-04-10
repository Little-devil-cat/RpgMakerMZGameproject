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

    var ArrowController = {
        _arrowSprite: null,
        _parent: null,
    }

    Window_BattleStatus.prototype.drawArrow = function(x, y) {
        if (ArrowController._arrowSprite) {
            ArrowController._parent.removeChild(this._arrowSprite);
            ArrowController._arrowSprite.destroy()
            ArrowController._arrowSprite = null;
            ArrowController._parent = null;
        }
        var bitmap = ImageManager.loadExPic("Arrow");
        this._arrowSprite = new Sprite(bitmap);
        this._arrowSprite.move(x, y);
        this.addChild(this._arrowSprite);
        ArrowController._arrowSprite = this._arrowSprite
        ArrowController._parent = this
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
            if (ArrowController._arrowSprite) {
                ArrowController._parent.removeChild(this._arrowSprite);
                ArrowController._arrowSprite.destroy()
                ArrowController._arrowSprite = null;
                ArrowController._parent = null;
            }
        }
        this.callUpdateHelp();
    }

})()