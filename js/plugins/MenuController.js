/*
* 2023/3/24
* 1-4
*
* */
(() => {
    /*
    * 1. 去除返回按钮/菜单按钮 还有左上角的小标也要去掉
    * 选项里OFF触屏界面按钮 默认启动时设置为false
    * */
    ConfigManager.touchUI = false;
    ConfigManager.applyData = function (config) {
        this.alwaysDash = this.readFlag(config, "alwaysDash", false);
        this.commandRemember = this.readFlag(config, "commandRemember", false);
        // this.touchUI = this.readFlag(config, "touchUI", true);
        this.touchUI = this.readFlag(config, "touchUI", false);
        this.bgmVolume = this.readVolume(config, "bgmVolume");
        this.bgsVolume = this.readVolume(config, "bgsVolume");
        this.meVolume = this.readVolume(config, "meVolume");
        this.seVolume = this.readVolume(config, "seVolume");
    };
    /*
    * 2. 战斗系统会先加载“战斗/逃跑”的选项界面，把这个界面去掉，把逃跑选项放到物品的后面
    * 处理逻辑为 进入战斗后自动选择战斗 添加escape选项
    * */

    Scene_Battle.prototype.startPartyCommandSelection = function () {
        this.commandFight();
    };
    /*
    * 3. 观察是第一个选项，把他放到防御和治疗中间
    * */
    Window_ActorCommand.prototype.makeCommandList = function () {
        if (this._actor) {
            this.addSkillCommands();
            this.addAttackCommand(); //观察
            this.addGuardCommand();
            this.addItemCommand();
            this.addCommand(TextManager.escape, "escape", BattleManager.canEscape());
        }
    }
    /*
    * 4. 状态点进去太大了，把这个往左压缩一半，右边新增一栏能人物读取状态并显示
    * */
    Scene_Status.prototype.statusWindowRect = function () {
        const wx = 0;
        const wy = this.mainAreaTop();
        // const ww = Graphics.boxWidth;
        // 压缩
        const ww = Graphics.boxWidth * 2 / 3;
        const wh = this.statusParamsWindowRect().y - wy;
        return new Rectangle(wx, wy, ww, wh);
    };

    Scene_Status.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);
        this.createProfileWindow();
        this.createStatusWindow();
        this.createStatusParamsWindow();
        this.createStatusEquipWindow();
        //添加新的状态（中毒/死亡...）窗口
        this.createStatusBarWindow();
    };
    //创建新的状态（中毒/死亡...）窗口
    Scene_Status.prototype.createStatusBarWindow = function () {
        const rect = this.statusBarWindowRect();
        this._statusBarWindow = new Window_StatusBar(rect);
        this.addWindow(this._statusBarWindow);
    }
    Scene_Status.prototype.refreshActor = function() {
        const actor = this.actor();
        this._profileWindow.setText(actor.profile());
        this._statusWindow.setActor(actor);
        this._statusParamsWindow.setActor(actor);
        this._statusEquipWindow.setActor(actor);
        this._statusBarWindow.setActor(actor);
    };
    //大小调整
    Scene_Status.prototype.statusBarWindowRect = function () {
        const wx = Graphics.boxWidth * 2 / 3;
        const wy = this.mainAreaTop();
        const ww = Graphics.boxWidth / 3;
        const wh = this.statusParamsWindowRect().y - wy;
        return new Rectangle(wx, wy, ww, wh);
    }

    Window_Status.prototype.drawBasicInfo = function(x, y) {
        const lineHeight = this.lineHeight();
        this.drawActorLevel(this._actor, x, y + lineHeight * 0);
        // 关闭在左侧BAR的图标显示
        // this.drawActorIcons(this._actor, x, y + lineHeight * 1);
        this.placeBasicGauges(this._actor, x, y + lineHeight * 2);
    };
    function Window_StatusBar() {
        this.initialize(...arguments);
    }
    Window_StatusBar.prototype = Object.create(Window_StatusBase.prototype);
    Window_StatusBar.prototype.constructor = Window_StatusBar;
    Window_StatusBar.prototype.initialize = function(rect) {
        Window_StatusBase.prototype.initialize.call(this, rect);
        this.refresh();
    };
    Window_StatusBar.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this.refresh();
        }
    };

    Window_StatusBar.prototype.refresh = function () {
        Window_StatusBase.prototype.refresh.call(this);
        if (this._actor) {
            this.drawStateItem(this._actor, 10, 10)
        }
    }
    Window_StatusBar.prototype.drawStateItem = function (actor, x, y) {
        const lineHeight = this.lineHeight();
        const boxWidth = Graphics.boxWidth / 3;
        let states = actor.states();
        for (let i = 0; i < states.length; i++) {
            this.drawIcon(states[i].iconIndex, x, y);
            this.drawText(states[i].name, 1.5 * ImageManager.iconWidth, y, boxWidth / 2 - 2.5 * ImageManager.iconWidth, 'center');
            if (i + 1 >= states.length){
                break;
            }
            i++;
            this.drawIcon(states[i].iconIndex, x + boxWidth / 2, y);
            this.drawText(states[i].name, boxWidth / 2 + 1.5 * ImageManager.iconWidth, y, boxWidth / 2 - 2.5 * ImageManager.iconWidth, 'center');
            y += lineHeight
        }
    }


})()