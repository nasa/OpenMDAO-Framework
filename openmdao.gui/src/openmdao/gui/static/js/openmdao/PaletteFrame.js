
var openmdao = (typeof openmdao === "undefined" || !openmdao ) ? {} : openmdao ;

openmdao.PaletteFrame = function(id,model) {
    openmdao.PaletteFrame.prototype.init.call(this,id,'Libraries',[]);

    /***********************************************************************
     *  private
     ***********************************************************************/

    // initialize private variables
    var self = this,
        palette = jQuery('#'+id),
        libs = jQuery('<div>').appendTo(palette);

    // dropping a filename onto the palette pane means import *
    /*
    libs.droppable ({
        accept: '.file',
        drop: function(ev,ui) {
            debug.info('PaletteFrame drop: ',ev,ui);
            var droppedObject = jQuery(ui.draggable).clone();
            debug.info('PaletteFrame drop: ',droppedObject);
            var path = droppedObject.attr("path");
            debug.info('PaletteFrame drop: '+path);
            if (/.py$/.test(path)) {
                model.importFile(path);
            }
            else {
                alert("Not a python file:\n"+path);
            }
        }
    });
    */
    /** rebuild the Palette from a JSON library list of tuples of the form (libname, meta_dict) */
    function updatePalette(packages) {
        // remember what is expanded
        //var expanded = jQuery('.library-list:visible');

        // build the new html
        var html="<div id='library'>";
        html+= '<table cellpadding="0" cellspacing="0" border="0" id="objtypetable">';
        // headers: Class, Module Path, Version, Interfaces
        html += '<thead><tr><th></th><th></th><th></th><th></th></tr></thead><tbody>';
        html += '<div class="ui-widget"><label for="objtt-select">Search: </label><input id="objtt-select"></div>';
        jQuery.each(packages, function(name,item) {
            html+= packageHTML(name, item);
        });
        html+="</tbody></table></div>";

        // replace old html
        libs.html(html);
        
        var dtable = palette.find('#objtypetable').dataTable({
            'bPaginate': false,
            'bjQueryUI': true,
            'sScrollY': '500px',
            'bScrollCollapse': true,
            'bFilter': true,    // make sure filtering is still turned on
            'aoColumnDefs': [
                 { 'bVisible': false, 'aTargets': [1,2,3] }
             ],
            'sDom': 'lrtip'   // removes the built-in filter field
        });
        
        // here's the default list of filters for the library
        var selections = [
                    "In Project",
                    "Component",
                    "Driver",
                    "Solver",
                    "Assembly",
                    "Surrogate",
                    "DOEgenerator"
                ];
        var input_obj = jQuery('#objtt-select');
        input_obj.autocomplete({
           source: function(term, response_cb) {
               response_cb(selections);
           },
           select: function(event, ui) {
               input_obj.value = ui.item.value;
               ent = jQuery.Event('keypress.enterkey');
               ent.target = input_obj;
               ent.which = 13;
               input_obj.trigger(ent);
           },
           delay: 0,
           minLength: 0
        });
        input_obj.bind('keypress.enterkey', function(e) {
            if (e.which === 13) {
                dtable.fnFilter( e.target.value );
                if (selections.indexOf(e.target.value) === -1) {
                   selections.push(e.target.value);
                }
                input_obj.autocomplete('close');
            }
        });
        
        // make everything draggable
        jQuery('.objtype').draggable({ helper: 'clone', appendTo: 'body' });
        jQuery('.objtype').addClass('jstree-draggable'); // allow drop on jstree
    }

    /** build HTML string for a package */
    function packageHTML(name,item) {
        var html = "<tr><td class='objtype' modpath="+item.modpath+">"+name+"</td><td>"+
                   item.modpath+"</td><td>"+item.version+"</td><td>"+item.ifaces+"</td></tr>";
        return html;
    }

    function handleMessage(message) {
        if (message.length !== 2 || message[0] !== 'types') {
            debug.warn('Invalid types data:',message);
            debug.warn('message length',message.length,'topic',message[0]);
        }
        else {
            libs.html("<div>Updating...</div>")
                .effect('highlight',{color:'#ffd'},1000);
            updatePalette(message[1][0]);
        }
    }

    /***********************************************************************
     *  privileged
     ***********************************************************************/

    /** update the display, with data from the model */
    this.update = function() {
        libs.html("<div>Updating...</div>")
            .effect('highlight',{color:'#ffd'},1000);
        model.getTypes(updatePalette);
    };

    // ask model for an update whenever something changes
    model.addListener('types',handleMessage);
    
    this.update();

};

/** set prototype */
openmdao.PaletteFrame.prototype = new openmdao.BaseFrame();
openmdao.PaletteFrame.prototype.constructor = openmdao.PaletteFrame;

