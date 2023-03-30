/*:
 * @plugindesc 战斗界面增加行动顺序显示条
 * @author Hale Lin
 *
 */

// 实现文字条在行动顺序下方

Scene_Battle.prototype.logWindowRect = function() {
    const wx = Graphics.boxWidth / 4;
    const wy = Graphics.boxHeight / 6;
    const ww = Graphics.boxWidth / 2;
    const wh = this.calcWindowHeight(10, false);
    return new Rectangle(wx, wy, ww, wh);
};

Window_BattleLog.prototype.drawLineText = function(index) {
    const rect = this.lineRect(index);
    this.contents.clearRect(rect.x, rect.y, rect.width, rect.height);
    // this.drawTextEx(this._lines[index], rect.x, rect.y, rect.width);
    this.drawTextExCenter(this._lines[index], rect.x, rect.y, rect.width);
};

Window_Base.prototype.drawTextExCenter = function(text, x, y, width) {
    // 计算文本宽度
    const textWidth = this.drawTextEx(text, 0, this.contents.height);
    // 计算左侧边距
    const leftMargin = (this.width - textWidth) / 2;
    // 输出文本
    this.drawTextEx(text, x + leftMargin, y, width);
};

//=====================================================================================

BattleManager.startTurn = function () {
    this._phase = "turn";
    $gameTroop.increaseTurn();
    $gameParty.requestMotionRefresh();
    if (!this.isTpb()) {
        // 让速度计算在回合初进行
        // this.makeActionOrders();
        this._logWindow.startTurn();
        this._inputting = false;
    }
};

BattleManager.startBattle = function () {
    this._phase = "start";
    $gameSystem.onBattleStart();
    $gameParty.onBattleStart(this._preemptive);
    $gameTroop.onBattleStart(this._surprise);
    this.makeActionOrders() // add
    this.displayStartMessages();
};
BattleManager.endTurn = function () {
    this._phase = "turnEnd";
    this._preemptive = false;
    this._surprise = false;
    this.makeActionOrders() // add
};

BattleManager.makeActionOrders = function () {
    const battlers = [];
    if (!this._surprise) {
        battlers.push(...$gameParty.battleMembers());
    }
    if (!this._preemptive) {
        battlers.push(...$gameTroop.members());
    }
    for (const battler of battlers) {
        // battler.makeSpeed();
        if (battler._enemyId) {
            battler._speed = battler.agi * 100
        }
        // 敏捷 * 0.8 ~ 1.2 + 等级 * 0.1
        else {
            battler._speed = battler.agi * Math.floor((Math.random() * 0.4 + 0.8) * 100) + battler._level * 0.1
        }
    }
    battlers.sort((a, b) => b.speed() - a.speed());
    console.log(battlers)
    this._actionBattlers = battlers;
};


function Window_Speed() {
    this.initialize.apply(this, arguments);
}

Window_Speed.prototype = Object.create(Window_Base.prototype);
Window_Speed.prototype.constructor = Window_Speed;

Window_Speed.prototype.initialize = function (rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.refresh();
};

//=====================================================================================

function Sprite_myEnemy(enemy) {
    Sprite.call(this);
    this._enemy = enemy;
    this.createMainBitmap();
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
}

Sprite_myEnemy.prototype = Object.create(Sprite.prototype);
Sprite_myEnemy.prototype.constructor = Sprite_myEnemy;

// 加载敌人图像
Sprite_myEnemy.prototype.createMainBitmap = function () {
    var name = this._enemy.battlerName();
    var hue = this._enemy.battlerHue();
    this.bitmap = ImageManager.loadSvEnemy(name, hue);
};

//=====================================================================================

function Sprite_myActor(actor) {
    Sprite.call(this);
    this._actor = actor;
    this.createMainBitmap();
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
}

Sprite_myActor.prototype = Object.create(Sprite.prototype);
Sprite_myActor.prototype.constructor = Sprite_myActor;

// 加载友军图像
Sprite_myActor.prototype.createMainBitmap = function () {
    var name = this._actor._faceName;
    this.bitmap = ImageManager.loadFace(name);
};


Window_Speed.prototype.refresh = function () {
    if (this._innerChildren.length !== BattleManager._actionBattlers.length) {
        if (this._innerChildren.length > BattleManager._actionBattlers.length) {
            var children = this._innerChildren;
            for (var i = 0; i < children.length; i++) {
                this._innerChildren.shift(i).destroy();
            }
        }

        let scale = 0.4;
        let spacingX = ImageManager.faceWidth * scale * 1.1
        let x = (Graphics.boxWidth - spacingX * BattleManager._actionBattlers.length) / 2;
        let y = this.innerHeight / 2;
        for (const actionBattler of BattleManager._actionBattlers) {
            // 死了就不画了
            if (actionBattler._states.indexOf(1) >= 0) {
                continue
            }
            if (actionBattler._actorId) {
                let spriteActor = new Sprite_myActor(actionBattler)
                spriteActor.setFrame((actionBattler._faceIndex % 4) * ImageManager.faceWidth, Math.floor(actionBattler._faceIndex / 4) * ImageManager.faceHeight, ImageManager.faceWidth, ImageManager.faceHeight)
                spriteActor.scale.x = scale;
                spriteActor.scale.y = scale;
                spriteActor.x = x;
                spriteActor.y = y;
                this.addInnerChild(spriteActor);
            } else {
                let spriteEnemy = new Sprite_myEnemy(actionBattler)
                spriteEnemy.setFrame(0, 0, ImageManager.faceWidth, ImageManager.faceHeight);
                spriteEnemy.scale.x = scale;
                spriteEnemy.scale.y = scale;
                spriteEnemy.x = x;
                spriteEnemy.y = y;
                this.addInnerChild(spriteEnemy);
            }
            console.log(BattleManager._actionBattlers, this._innerChildren)
            x += spacingX;
        }
    }

};

Scene_Battle._speedWindow = null

Scene_Battle.prototype.createAllWindows = function () {
    this.createLogWindow();
    this.createStatusWindow();
    this.createPartyCommandWindow();
    this.createActorCommandWindow();
    this.createHelpWindow();
    this.createSkillWindow();
    this.createItemWindow();
    this.createActorWindow();
    this.createEnemyWindow();
    this.createSpeedWindow(); // 创建速度窗口
    Scene_Message.prototype.createAllWindows.call(this);
};

Scene_Battle.prototype.createSpeedWindow = function () {
    this._speedWindow = new Window_Speed(new Rectangle(0, 0, Graphics.boxWidth, Graphics.boxHeight / 6));
    this.addWindow(this._speedWindow);
    console.log(this._speedWindow)
};

var old_Scene_Battle_update = Scene_Battle.prototype.update


Scene_Battle.prototype.update = function () {
    old_Scene_Battle_update.call(this)
    if (this._speedWindow) {
        this._speedWindow.refresh();
    }
}
