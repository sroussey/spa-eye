define([
    "firebug/firebug",
    "firebug/lib/object",
    "firebug/lib/trace",
    "firebug/lib/locale",
    "firebug/lib/domplate",
    "firebug/lib/dom",
    "firebug/lib/css",
    "firebug/lib/events",
    "firebug/chrome/reps",
    "spa_eye/dom/section",
    "spa_eye/dom/modelReps",

    "firebug/dom/domReps",

    "spa_eye/panels/basePanel"
],
    function (Firebug, Obj, FBTrace, Locale, Domplate, Dom, Css, Events, FirebugReps, ChildSection, ModelReps, DOMReps, BasePanel) {

        var eventPanel = Firebug.eventPanel = BasePanel.extend({
            name:"spa_eye:event",
            title:Locale.$STR("spa_eye.event.title"),

            parentPanel:"spa_eye",
            order:0,


            initialize:function () {
                this._super.apply(this, arguments);
                //var splitter = Firebug.chrome.window.document.createElement("hr");
                /*splitter.setAttribute("orient","horizontal");
                 splitter.setAttribute("id","eventSplitter");
                 splitter.setAttribute("collapse","none");
                 splitter.setAttribute("tooltip","hello there");*/

                this.timeline.TIMELINE.replace({object:[]}, this.panelNode);
                this.timeline.TABLE.append({}, this.panelNode);
                this.timeline.tag.append({sections:[], mainPanel:this.panelNode}, this.panelNode.lastChild);
                //this.panelNode.parentNode.insertBefore(splitter, this.panelNode.lastChild);

                this.sequenceEditor = this.panelNode.firstChild.contentWindow;
                var self = this;
                this.panelNode.firstChild.onload = function () {
                    self.show();
                }

            },

            onModelOfInterestChange:function (m) {
                this.show();
            },

            onModelSet:function () {
                this.show();
            },

            onModelFetch:function () {
                this.show();
            },

            onModelSave:function () {
                this.show();
            },

            onTrackingDataCleared:function () {
                this.show();
            },

            onToggleHeader:function (section, panel) {

                if (panel === this.panelNode) {
                    var title = section.title;
                    var idx = 0;
                    if (title) {
                        var matches = title.split('=');
                        (matches.length === 2) && (idx = parseInt(matches[1]));
                    }
                    var data = section.data;
                    var cid = data[0] && data[0].cid;
                    var win = this.context.window.wrappedJSObject;
                    this.plotData = win.spa_eye.sequence[cid] ?
                        [win.spa_eye.sequence[cid].flows[idx]] : [];
                    this.plotFlow(cid, idx);
                }

            },

            show:function () {
                var spa_eyeObj = this.context.spa_eyeObj;
                var moi = spa_eyeObj && spa_eyeObj._moi;
                var idx = 0;
                if (moi && moi.cid) {
                    var win = this.context.window.wrappedJSObject;
                    var sequence = win.spa_eye.sequence[moi.cid];
                    this.sequenceData = (sequence && sequence.flows) ? sequence.flows : [];
                    idx = this.sequenceData.length - 1;
                    this.plotData = idx >= 0 ? [this.sequenceData[idx]] : [];
                } else {
                    this.sequenceData = [];
                    this.plotData = []
                }
                this.plotFlow(moi.cid, idx);
                this.tabulateData();

            },

            plotFlow:function (id, index) {
                this.sequenceEditor && this.sequenceEditor.draw && this.sequenceEditor.draw(this.plotData, id, index);
            },

            tabulateData:function () {

                if (this.sequenceData) {
                    var sections = [];
                    for (var i = this.sequenceData.length - 1; i >= 0; --i) {
                        sections.push(new ChildSection({
                            title:'t=' + i,
                            parent:this.panelNode,
                            autoAdd:false,
                            data:this.sequenceData[i]
                        }));
                    }

                    var args = {
                        sections:sections,
                        mainPanel:this.panelNode
                    };

                    this.timeline.tag.replace(args, this.panelNode.lastChild);
                }
            }
        });

// ********************************************************************************************* //
// Templates

        with (Domplate) {
            eventPanel.prototype.timeline = domplate(ModelReps.DirTablePlate, {
                TIMELINE:IFRAME({src:"chrome://spa_eye/content/panels/eventPanel.xul",
                    width:"100%",
                    name:"timeline",
                    id:"timeline",
                    height:"50%",
                    frameborder:"0"
                }),

                TABLE:DIV({width:"100%", height:"50%"})
            });
        }

// ********************************************************************************************* //
// Registration


        return eventPanel;

// ********************************************************************************************* //

    });
