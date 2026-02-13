/**
 * picture.js 
 * A powerful JavaScript class for formatting, deformatting, and validating data using "picture strings" 
 * (compact format descriptors for strings, numbers, dates, times, and patterns).
 * 
 * Picture is a static-only JavaScript class. All methods are called directly on the class, no instantiation needed.
 * It provides three core capabilities:
 * 
 *    1. Formatting — Transform raw data into display-ready strings.
 *    2. Deformatting — Extract raw data back from formatted strings.
 *    3. Validation — Check whether a value matches the constraints defined by a picture string.
 * 
 * Additionally, Picture can bind directly to DOM <input> elements, providing real-time keystroke validation, formatting on blur, and deformatting on focus.
 * 
 * You can follow the project on: https://github.com/frikimirinda/picture
 * 
 * This class also uses the function NUMBER_FORMAT taken from https://github.com/locutusjs/locutus/tree/main by Kevin van Zonneveld and other authors.
 * 
 * 
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 * 
 */
export class Picture {
	static version = '1.0.0';
	static re_isPic = /^(?<TYPE>[SNDTEP]){1}(?<FORMAT>.+)/;
	static re_formats = {
		'S':/^(?<SIZE>[0-9]+)(?<CASE>[ULCA]?)(~REAC~(?<REAC>[^~]*))?(~REVA~(?<REVA>[^~]*))?(~RETY~(?<RETY>[^~]*))?/,
		'N':/^(?<CURRENCY>[$€£¥%]?|(~.{1,10}~)?)(?<CURRENCY_POS>\<|\>?)(?<THOUSANDS_SEP>[,\._]?)(?<SIGN>[\[\(+-]?)(?<SIGN_POS>\<|\>?)(?<FILL>[0_\*]?)(?<SIZE>[0-9]{1,})(?<DECIMALS_SEP>[,\._]?)(?<DECIMALS>[0-9]*)(?<BLANK_IF_ZERO>B?)(?<ALIGN>[LCR]?)/,
		'D':/^(?<FORMAT>[0-9]+|.+)(?<SEPARATOR>[\/,\-\.\_]?)/,
		'T':/^(?<FORMAT>[0-9]+|.+)(?<SEPARATOR>[:,\-\.\_]?)/,
		'I':/^(?<PARAM1>(?<DATEORTIME1>[DT]{1})(?<FORMAT1>[0-9]+)(?<SEPARATOR1>[:,\/\-\.\_]?)){1}(?<SEPARATOR>.*)(?<PARAM2>(?<DATEORTIME2>[DT]{1})(?<FORMAT2>[0-9]+)(?<SEPARATOR2>[:,\/\-\.\_]?)){1}/,
		'P':/^(?<FORMAT>.*)/
	};
    /*
		The date format is the same as in PHP:
			d Day of the month with leading zeros 01-31
			j Day of the month without leading zeros 1-31
			m Month number with leading zeros 01-12
			n Month number without zeros 1-12
			Y Year with 4 digits
			y Year with 2 digits
			z Day of the year 0-365
			D Day of the week Sun(0)=>Sat(6)
			l Day of the week Sunday(0)=>Saturday(6)
			N Day of the week 1 (Monday)=>7 (Sunday)
			w Day of the week 0 (Sun)=>6 (Sat)
			W Week of the year
			F Full name of the month
			M Name of the month (Jan)=>(Dec)
			t Number of days in the given month 28=>31
			L (1) If it is a leap year
			To inject text, put it in "~" for example ~week~ (0126)

        El formato de fechas es el mismo que en PHP:
            d Día del mes con ceros por la izquierda 01-31
            j Día del mes sin ceros iniciales 1-31
            m Número del mes con cero por la izquierda 01-12
            n Número del mes sin ceros 1-12
            Y Año con 4 dígitos
            y Año con 2 dígitos
            z Día del año 0-365
            D Día de la semana Sun(0)=>Sat(6)
            l Día de la semana Sunday(0)=>Saturday(6)
            N Día de la semana 1(lunes)=>7(domingo)
            w Día de la semana 0(Sun)=>6(Sat)
            W Semana del año
            F Nombre completo del mes
            M Nombre del mes (Ene)=>(Dic)
            t Número de días del mes dado 28=>31
            L (1)Si es un año bisiesto
            Para inyectar texto ponerlo entre "~"  por ejemplo ~semana~ (0126)
    */
	static re_date = {
		'1':{'FORMAT':'d/m/Y'},
		'2':{'FORMAT':'d/m/y'},
		'3':{'FORMAT':'m/d/Y'},
		'4':{'FORMAT':'m/d/y'},
		'5':{'FORMAT':'Y/m/d'},
		'6':{'FORMAT':'Y/d/m'},
        '7':{'FORMAT':"l d ~d~e F ~d~e Y"},
        '8':{'FORMAT':"l d ~d~e F Y ~(semana ~W)"},
		'9':{'FORMAT':"F j, Y"},
		'10':{'FORMAT':"j F Y"},
		'11':{'FORMAT':"l, F j, Y"},
	};

	static re_date_formats = {
		'd':'(?<DAY1>[0-3]{1})(?<DAY2>[0-9]{1})',
		'm':'(?<MONTH1>[0-1]{1})(?<MONTH2>[0-9]{1})',
		'Y':'(?<YEAR>[0-9]{4})'
	};

	static re_time = {
		'1':{'FORMAT':'H:i:s'},
		'2':{'FORMAT':'H:i'},
	};
	static re_time_formats = {
		'H':'(?<HOUR>[0-2]{1})(?<HOUR2>[0-9]{1})',
		'i':'(?<MIN1>[0-5]{1})(?<MIN2>[0-9]{1})',
		's':'(?<SEC1>[0-5]{1})(?<SEC2>[0-9]{1})'
	};
	static CURRENCY_POS 	= '>';
	static THOUSANDS_SEP 	= '';
	static DECIMALS_SEP  	= ',';
	static SIGN 			= '-';
	static SIGN_POS 		= '<';
	static DATE_SEPARATOR	= '/';
	static TIME_SEPARATOR	= ':';
	static DATE_CONFIG 		= {
		'EN':{
			'D':['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
			'l':['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
			'N':[1,2,3,4,5,6,7],
			'w':[0,1,2,3,4,5,6],
			'F':['January','February','March','April','May','June','July','August','September','October','November','December'],
			'M':['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
		},
		'ES':{
			'D':['Dom','Lun','Mar','Mie','Jue','Vie','Sáb'],
			'l':['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'],
			'N':[7,1,2,3,4,5,6],
			'w':[0,1,2,3,4,5,6],
			'F':['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
			'M':['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
		}
	};
	static DATE_LNG 		= 'ES';
	static STRING_LNG 		= 'ES';
	// For the Patterns
	static STRING = {
		'EN':{
			'a':'a-z',
			'A':'A-Z',
		},
		'ES': {
			'a':'a-zñ',
			'A':'A-ZÑ',
		}
	}

    // Get picture info
    static picInfo(picture){
        return this.getData(picture);
    }
    // Format a value
    static format(data,picture){
		picture = this.getData(picture);
		if(!picture) return false;
		return this[ 'format_'+picture.TYPE ](data,picture);
    }
    // Return the value without the format
	static deformat( data, picture ){
		picture = this.getData(picture);
		if(!picture) return false;
		return this[ 'deformat_'+picture.TYPE ](data,picture);
	}
    // Capitalize a string (if all==null only capitalize the first word)
	static capitalize(s,all){
		if(all==null) return s.charAt(0).toUpperCase()+s.slice(1);
		return s.replace(/\b\w/g, function(l){ return l.toUpperCase() })
	}
	// Remove padding from the left
	static removeFill( data, picture ){
		picture = this.getData(picture);
		if(!picture) return false;
		if( picture.FILL!='' )
			return data.replace( new RegExp("^"+picture.FILL+"+"), '')*1;
		return data*1;
	}
    // Test if a value is valid
    static isValid( data, picture ){
		picture = this.getData(picture);
		if(!picture) return false;
        return picture.PATTERNVALRE.test(data);
    }



	static getData(picture){
		if( !this.re_isPic.test(picture) ) return false;
		let r0 = this.re_isPic.exec(picture);
		let groups=null;
		try{
			groups 					= this.re_formats[ r0.groups.TYPE ].exec( r0.groups.FORMAT ).groups;
			groups.TYPE 			= r0.groups.TYPE;
			groups.PICTURE 			= picture;
			if(groups.TYPE=='x' && groups.REAC||null!=null ){
				groups.PATTERN 			= groups.REAC;
				groups.PATTERNRE 		= new RegExp( groups.PATTERN );
				groups.PATTERNVAL 		= '^'+groups.REVA+'{,'+groups.SIZE+'}$';
				groups.PATTERNVALRE  	= new RegExp( groups.PATTERNVAL );
				groups.PATTERNTYPING  	= groups.RETY;
				groups.PATTERNTYPINGRE  = new RegExp( groups.PATTERNTYPING );
			}else if(groups.TYPE=='P'){
				let tp 					= this[ 'getTypingRexExp_'+groups.TYPE ]( groups );
				groups.PATTERN  		= this[ 'getAllowedChars_'+groups.TYPE ]( groups ); 	// all the characters that the field can have
				groups.PATTERNRE 		= new RegExp( groups.PATTERN );
				groups.PATTERNVALRE		= groups.PATTERNRE;
				groups.PATTERNTYPING  	= tp.PATTERNTYPING;			// while the user is typing, what can be pressed
				groups.PATTERNTYPINGRE  = new RegExp( groups.PATTERNTYPING );
				groups.TYPINGARRAY 		= tp.TYPINGARRAY;
				groups.TYPINGARRAY2 	= tp.TYPINGARRAY2;
				groups.TYPINGARRAYRE	= tp.TYPINGARRAYRE;
			}else{
				groups.PATTERN  		= this[ 'getAllowedChars_'+groups.TYPE ]( groups ); 	// all the characters that the field can have
				groups.PATTERNVAL  	 	= this[ 'getValidationRexExp_'+groups.TYPE ]( groups );	// regular exp when leaving the field to validate the content
				groups.PATTERNTYPING  	= this[ 'getTypingRexExp_'+groups.TYPE ]( groups );		// while the user is typing, what can be pressed
				groups.PATTERNTYPINGRE  = new RegExp( groups.PATTERNTYPING );
				groups.PATTERNRE 		= new RegExp( groups.PATTERN );
				groups.PATTERNVALRE  	= new RegExp( groups.PATTERNVAL );
			}
			if( groups.TYPE=='D' ){
				if( this.re_date[groups.FORMAT]==undefined ){
					groups.re_date  = {'FORMAT':groups.FORMAT};
					groups.SEPARATOR= null;
				}else{
					groups.re_date = this.re_date[groups.FORMAT];
					if( groups.SEPARATOR=='' ) groups.SEPARATOR=this.DATE_SEPARATOR;
				}
			}else if( groups.TYPE=='T' ){
				if( this.re_time[groups.FORMAT]==undefined ){
					groups.re_time  = {'FORMAT':groups.FORMAT};
					groups.SEPARATOR= null;
				}else{
					groups.re_time = this.re_time[groups.FORMAT];
					if( groups.SEPARATOR=='' ) groups.SEPARATOR=this.TIME_SEPARATOR;
				}
			}
		}catch(e){
			console.log('Picture getData error: '+picture+' => '+e.message);
			return false;
		}
		return groups;
	}


	/* --------------------------------------------------------------------------
		TYPE => N  Number
	-------------------------------------------------------------------------- */
	static format_N( data, pic ){
		pic.THOUSANDS_SEP 	= ( pic.THOUSANDS_SEP=='' )? this.THOUSANDS_SEP 	: pic.THOUSANDS_SEP;
		pic.DECIMALS_SEP	= ( pic.DECIMALS_SEP =='' )? this.DECIMALS_SEP		: pic.DECIMALS_SEP;
		pic.DECIMALS		= ( pic.DECIMALS 	 =='' )? 0						: pic.DECIMALS;
		pic.SIGN 			= ( pic.SIGN 	=='' )? this.SIGN 		: pic.SIGN;
		pic.SIGN_POS 		= ( pic.SIGN_POS=='' )? this.SIGN_POS 	: pic.SIGN_POS;
		if( pic.SIGN!='' && pic.SIGN_POS=='>' && (data+'').indexOf('-')>-1 ){
			data = (data+'').replace(/\-/,'');
			data = Number(data)*-1;
		}
		if( pic.BLANK_IF_ZERO=='B' && data==0 ) return '';
		let v = this.number_format( data, pic.DECIMALS, pic.DECIMALS_SEP, pic.THOUSANDS_SEP );
		// FILL - Fill from the left
		if( pic.FILL!='' ){
			let f =( pic.THOUSANDS_SEP=='' )? 0 : (v.match(new RegExp( "\\"+pic.THOUSANDS_SEP, "g")) || []).length;
			    f+=( pic.DECIMALS_SEP=='' )?  0 : (v.match(new RegExp( "\\"+pic.DECIMALS_SEP, "g"))  || []).length;
			v = v.padStart( Number(pic.SIZE)+f, pic.FILL );
		}else{
			v = this.number_format( data, pic.DECIMALS, pic.DECIMALS_SEP, pic.THOUSANDS_SEP );
		}
		// SIGN - Negative sign
		if(data<0){
			if( pic.SIGN=='[' ){
				v  = v.replace(/\-/,'[');
				v += ']';
			}else if( pic.SIGN=='(' ){
				v  = v.replace(/\-/,'(');
				v += ')';
			}else if( pic.SIGN=='+' ){
				v  = v.replace(/\-/,'');
			}else if( pic.SIGN_POS=='>' ){
				v  = v.replace(/\-/,'');
				v += pic.SIGN;
			}
		}
		// CURRENCY
		if( pic.CURRENCY!='' ){
			pic.CURRENCY_POS = ( pic.CURRENCY_POS=='' )? this.CURRENCY_POS : pic.CURRENCY_POS;
			pic.CURRENCY 	 = pic.CURRENCY.replace(/~/g,'');
			v = ( pic.CURRENCY_POS=='>' )? (v+pic.CURRENCY+'') : (pic.CURRENCY+v+'');
		}
		return v;
	}
	static deformat_N( data, pic ){
		let v=data+'';
		// Currency
		if( pic.CURRENCY!='' ){
			pic.CURRENCY 	 = pic.CURRENCY.replace(/~/g,'');
			v = data.replace(pic.CURRENCY,'');
		}
		// Negative sign
			pic.SIGN 		= ( pic.SIGN 	=='' )? this.SIGN 		: pic.SIGN;
			pic.SIGN_POS 	= ( pic.SIGN_POS=='' )? this.SIGN_POS 	: pic.SIGN_POS;
			v = v.replace(/\]|\)/g,'');
			v = v.replace(/\[|\(/g,'-');
			if( v.indexOf('-')>-1 && pic.SIGN_POS=='>' ){
				v = v.replace('-','');
				v = '-'+v;
			}
		pic.THOUSANDS_SEP 	= ( pic.THOUSANDS_SEP=='' )? this.THOUSANDS_SEP 	: pic.THOUSANDS_SEP;
		pic.DECIMALS_SEP	= ( pic.DECIMALS_SEP =='' )? this.DECIMALS_SEP		: pic.DECIMALS_SEP;
		pic.DECIMALS		= ( pic.DECIMALS 	 =='' )? 0						: pic.DECIMALS;
		// Thousands and decimals
		if( pic.DECIMALS_SEP!=''  ) v = v.replace( new RegExp('\\'+pic.DECIMALS_SEP, 'g'), '~');
		if( pic.THOUSANDS_SEP!='' ) v = v.replace( new RegExp('\\'+pic.THOUSANDS_SEP,'g'), '');
		v = v.replace( new RegExp('~+','g') ,'.');
		// If it has padding on the left it is returned as is
		if( pic.FILL!='' ){
            v = v.replace( new RegExp('[0\_\*]+','g') ,'');
			return v;
		}
		// Since it is a number, a number is returned
		return Number(v);
	}
	// Obtain RegExp that is used to validate each key pressed in OnKeyPress (the characters that can be typed)
	static getAllowedChars_N(pic){
		let r = '0-9';
		pic.SIGN 		= ( pic.SIGN 	=='' )? this.SIGN 		: pic.SIGN;
		if( pic.SIGN!='' && pic.SIGN!='+' )
			r += "\\-";
		if( pic.DECIMALS!=0 )
			r += '\\.';
		return '['+r+']';
	}
	// Obtain RegExp that is used to validate the data in OnChange
	static getValidationRexExp_N(pic){
		let r = '^';
		let e = '$';
		pic.SIGN 		= ( pic.SIGN 	=='' )? this.SIGN 		: pic.SIGN;
		pic.SIGN_POS 	= ( pic.SIGN_POS=='' )? this.SIGN_POS 	: pic.SIGN_POS;
		if( pic.SIGN!='' && pic.SIGN!='+' ){
			if( pic.SIGN_POS=='>' ){
				e = '\\-?$';
			}else{
				r = "^\\-?";
			}
		}
		if( pic.DECIMALS!=0 ){
			let enteros = pic.SIZE - pic.DECIMALS;
			r += '(([0-9]{0,'+enteros+'}\\.{1}[0-9]{0,'+pic.DECIMALS+'})|([0-9]{0,'+enteros+'})|(\\.{1}[0-9]{0,'+pic.DECIMALS+'}))' + e;
		}else{
			r += '[0-9]{0,'+pic.SIZE+'}'+e;
		}
		return r;
	}
	// Obtain RegExp that is used to validate the data in OnKeypress
	static getTypingRexExp_N(pic){
		let r = '';
		let e = '';
		pic.SIGN 		= ( pic.SIGN 	=='' )? this.SIGN 		: pic.SIGN;
		pic.SIGN_POS 	= ( pic.SIGN_POS=='' )? this.SIGN_POS 	: pic.SIGN_POS;
		if( pic.SIGN!='' && pic.SIGN!='+' ){
			if( pic.SIGN_POS=='>' ){
				e = '\\-?';
			}else{
				r = "^\\-?";
			}
		}
		if( pic.DECIMALS!=0 ){
			let enteros = pic.SIZE - pic.DECIMALS;
			r += '[0-9]{0,'+enteros+'}\\.?[0-9]{0,'+pic.DECIMALS+'}' + e;
		}else{
			r += '[0-9]{0,'+pic.SIZE+'}'+e;
		}
		return r+'$';
	}

	/* --------------------------------------------------------------------------
		TYPE => S   String
	-------------------------------------------------------------------------- */
	static format_S( data, pic ){
		data+='';
		switch(pic.CASE){
			case 'U':data=data.toUpperCase();break;
			case 'L':data=data.toLowerCase();break;
			case 'C':data=this.capitalize( data.toLowerCase() );break;
			case 'A':data=this.capitalize( data.toLowerCase(),1 );break;
		}
		return data.substring(0,pic.SIZE);
	}
	static deformat_S( data, pic ){
		data+='';
		switch(pic.CASE){
			case 'U': data=data.toUpperCase();break;
			case 'L': data=data.toLowerCase();break;
			case 'C': data=this.capitalize( data.toLowerCase() );break;
			case 'A': data=this.capitalize( data.toLowerCase(),1 );break;
		}
		return String(data);
	}
	// Obtain RegExp that is used to validate each key pressed in OnKeyPress (the characters that can be typed)
	static getAllowedChars_S(pic){
		if(pic.REAC||null!==null)return pic.REAC;
		return '.';
	}
	// Obtain RegExp that is used to validate the data in OnChange
	static getValidationRexExp_S(pic){
		if( pic.REVA||null!=null)return '^'+pic.REVA+'$';
		return '^.{0,'+pic.SIZE+'}$';
	}
	// Obtain RegExp that is used to validate the data in OnKeypress
	static getTypingRexExp_S(pic){
		if( pic.RETY||null!=null)return '^'+pic.REAC+'$';
		return '^.{0,'+pic.SIZE+'}$';
	}

	/* --------------------------------------------------------------------------
		TYPE => D   DATE - ^(?<FORMAT>[0-9]+)(?<SEPARATOR>[\/,\-\.\_]?)
	-------------------------------------------------------------------------- */
	static deformat_D( data, pic ){
		return data+'';
	}
	// ***********************************************************************
	static _format_D_item(item,amd,dia,mes,ano){
		if( /d/.test(item) ) return dia.padStart(2,0);                  // Day of the month with leading zeros 01-31
		if( /j/.test(item) ) return Number(dia);			            // Day of the month without leading zeros 1-31
		if( /m/.test(item) ) return mes.padStart(2,0);                  // Month number with leading zero 01-12
		if( /n/.test(item) ) return Number(mes)                         // Month number without zeros 1-12
		if( /Y/.test(item) ) return ano;                                // Year with 4 digits
		if( /y/.test(item) ) return ano.substring(2);                   // Year with 2 digits
		if( /z/.test(item) ) return this.getDayOfYear(dia,mes);			// Day of the year 0-365
		if( /D/.test(item) ) return this.getDayOfWeek(amd,'D');			// Day of the week Sun(0)=>Sat(6)
		if( /l/.test(item) ) return this.getDayOfWeek(amd,'l');			// Day of the week Sunday(0)=>Saturday(6)
		if( /N/.test(item) ) return this.getDayOfWeek(amd,'N');			// Day of the week 1(Monday)=>7(Sunday)
		if( /w/.test(item) ) return this.getDayOfWeek(amd,'w');			// Day of the week 0(Sun)=>6(Sat)
		if( /W/.test(item) ) return this.getWeekOfYear(amd);			// Week of the year
		if( /F/.test(item) ) return this.getMonth(amd,'F');				// Full name of the month
		if( /M/.test(item) ) return this.getMonth(amd,'M');				// Short name of the month (Jan)=>(Dec)
		if( /t/.test(item) ) return this.getDaysInMonth(amd);			// Number of days in the given month 28=>31
		if( /L/.test(item) ) return Number(this.isLeapYear(ano));		// (1)If it is a leap year
		return item;
	}
	static format_D( data, pic ){
		let v=data+'';
		if(v=='') return '';
		const x=v.split('-');
		let ano=x[0];
		let mes=x[1];
		let dia=x[2];
		const regex = /(?<VAR>[^~])|(?<CONST>(~[^~]*~))/g;
		v='';
		let m=null;
		while ((m = regex.exec(pic.re_date.FORMAT)) !== null) {
		    if(m.index === regex.lastIndex)regex.lastIndex++;	// avoid infinite loops
		    if( m.groups.CONST!=undefined ){
		    	v += m.groups.CONST.replace(/~/g,'');
		    	continue;
		    }
		    if( pic.SEPARATOR!=null && /\//.test(m.groups.VAR) ){
		    	v+=pic.SEPARATOR;
		    	continue;
		    }
		    v+=this._format_D_item(m.groups.VAR,data,dia,mes,ano);
		}
		return String(v);
	}
	// Obtain RegExp that is used to validate each key pressed in OnKeyPress (the characters that can be typed)
	static getAllowedChars_D(pic){
		pic.SEPARATOR = (pic.SEPARATOR=='')?this.DATE_SEPARATOR:pic.SEPARATOR;
		const vali='[0-9·]';
		return vali.replace( new RegExp(/·/,'g'),pic.SEPARATOR);
	}
	// Obtain RegExp that is used to validate the data in OnChange
	static getValidationRexExp_D(pic){
		if(this.re_date[pic.FORMAT]==undefined)return '^.+$';
		let vali=this.re_date[pic.FORMAT].VALIDATION;
		if( vali==undefined ){
			let f=this.re_date[ pic.FORMAT ].FORMAT.split('/');
			vali=new Array();
			for(var x in f)
				vali.push( this.re_date_formats[f[x]] );
			pic.SEPARATOR = (pic.SEPARATOR=='')?this.DATE_SEPARATOR:pic.SEPARATOR;
			vali = '^'+vali.join( pic.SEPARATOR )+'$';
		}
		return vali.replace( new RegExp(/·/,'g'),pic.SEPARATOR);
	}
	// Obtain RegExp that is used to validate the data in OnKeypress
	static getTypingRexExp_D(pic){
		return '';
	}



	/* --------------------------------------------------------------------------
		TYPE => T   TIME - ^(?<FORMAT>[0-9]+|.+)(?<SEPARATOR>[:,\-\.\_]?)
	-------------------------------------------------------------------------- */
	static deformat_T( data, pic ){
		return data+'';
	}
	// ***********************************************************************
	static _format_T_item(item,hms,h,m,s){
		if( /a/.test(item) ) return this.getampm(h,m,s);        // am or pm (lowercase)
		if( /A/.test(item) ) return this.getAMPM(h,m,s);        // AM or PM (in capital letters)
		if( /g/.test(item) ) return (Number(h)%12)||12;         // time in 12h format without leading zeros
		if( /G/.test(item) ) return Number(h);                  // time in 24h format without leading zeros
		if( /g/.test(item) ) return ((Number(h)%12)||12).padStart(2,0);         // time in 12h format with leading zeros
		if( /H/.test(item) ) return h.padStart(2,0);            // time in 24h format with leading zeros
		if( /i/.test(item) ) return m.padStart(2,0);            // minutes with leading zeros
		if( /s/.test(item) ) return s.padStart(2,0);            // seconds with leading zeros
		return item;
	}
	static format_T( data, pic ){
		let v=data+'';
		if(v=='') return '';
		let x=v.split(':');
		if(x[0].length>2){
			x[1]=x[0].substring(2);
			x[0]=x[0].substring(0,2);
		}
		const hor=x[0];
		if(x[1].length>2){
			x[2]=x[1].substring(2);
			x[1]=x[1].substring(0,2);
		}
		const min=x[1];
		const seg=x[2]||'00';
		const regex = /(?<VAR>[^~])|(?<CONST>(~[^~]*~))/g;
		v='';
		let m=null;
		while ((m = regex.exec(pic.re_time.FORMAT)) !== null) {
		    if(m.index === regex.lastIndex)regex.lastIndex++;	// avoid infinite loops
		    if( m.groups.CONST!=undefined ){
		    	v += m.groups.CONST.replace(/~/g,'');
		    	continue;
		    }
		    if( pic.SEPARATOR!=null && /:/.test(m.groups.VAR) ){
		    	v+=pic.SEPARATOR;
		    	continue;
		    }
		    v+=this._format_T_item(m.groups.VAR,data,hor,min,seg);
		}
		return String(v);
	}
	// Obtain RegExp that is used to validate each key pressed in OnKeyPress (the characters that can be typed)
	static getAllowedChars_T(pic){
		pic.SEPARATOR = (pic.SEPARATOR=='')?this.TIME_SEPARATOR:pic.SEPARATOR;
		const vali='[0-9·]';
		return vali.replace( new RegExp(/·/,'g'),pic.SEPARATOR);
	}
	// Obtain RegExp that is used to validate the data in OnChange
	static getValidationRexExp_T(pic){
		if(this.re_time[pic.FORMAT]==undefined){
			return '^.+$';
		}
		let vali=this.re_time[pic.FORMAT].VALIDATION;
		if( vali==undefined ){
			let f=this.re_time[ pic.FORMAT ].FORMAT.split(':');
			vali=new Array();
			for(var x in f){
				vali.push( this.re_time_formats[f[x]] );
			}
			pic.SEPARATOR = (pic.SEPARATOR=='')?this.TIME_SEPARATOR:pic.SEPARATOR;
			vali = '^'+vali.join( pic.SEPARATOR )+'$';
		}
		return vali.replace( new RegExp(/·/,'g'),pic.SEPARATOR);
	}
	// Obtener RegExp que sirve para validar el dato en el OnKeypress
	static getTypingRexExp_T(pic){
		return '';
	}

	/* --------------------------------------------------------------------------
		TYPE => P   Pattern
	-------------------------------------------------------------------------- */
	static format_P( data, pic ){
		data+='';
		let ret='',ixdata=0;
		for(var x in pic.TYPINGARRAY){
			if(pic.TYPINGARRAY[x]!=''){
				ret+=pic.TYPINGARRAY[x];
			}else{
				let c=data[ixdata]||'';
				const ta2=pic.TYPINGARRAY2[x];
				if(ta2=='#' && (c=='' ||c==' ') ){
					c='0';
				}else if(ta2=='a' || ta2=='â'){
					c=c.toLowerCase();
				}else if(ta2=='A' || ta2=='Â'){
					c=c.toUpperCase();
				}else if(c!='' && (ta2=='<' || ta2=='#') ){
					if(!Number.isInteger(Number(c)))
						c=' ';
				}
				if(c=='') c=' ';
				ret+=c;
				ixdata+=1;
			}
		}
		return ret;
	}
	// ***********************************************************************
	static deformat_P( data, pic ){
		data+='';
		let ret='';
		for(var x in pic.TYPINGARRAY){
			if(pic.TYPINGARRAY[x]=='')
				ret+=data[x]||'';
		}
		return ret;
	}
	// Obtain RegExp that is used to validate each key pressed in OnKeyPress (the characters that can be typed)
	static escapeRegExp(str){
		return str.replace(/[.*+?^${}()|[\]\\\/\-]/g, '\\$&');
	}
	static getAllowedChars_P(pic){
		let r='',m=null;
		const regex = /(?<VAR>[^~])|(?<CONST>(~[^~]*~))/g;
		while ((m = regex.exec(pic.FORMAT)) !== null) {
		    if(m.index === regex.lastIndex)regex.lastIndex++;	// avoid infinite loops
		    if( m.groups.CONST!=undefined ){
		    	r += this.escapeRegExp( m.groups.CONST.replace(/~/g,'') );
		    	continue;
		    }
			/*
		    for(var x in m.groups.VAR){
		    	x=m.groups.VAR[x];
		    	if(x=='<' || x=='#'){
		    		r += '0-9';
		    	}else if( x=='A'){
		    		r += this.STRING[this.STRING_LNG]['A']+' ';
		    	}else if( x=='Â'){
		    		r += this.STRING[this.STRING_LNG]['A'];
		    	}else if( x=='a'){
		    		r += this.STRING[this.STRING_LNG]['a']+' ';
		    	}else if( x=='â'){
		    		r += this.STRING[this.STRING_LNG]['a'];
		    	}else if( x=='*'){
		    		r += '.';
		    	}else{
		    		r += '\\'+x;
		    	}
		    }
			*/	
			
		    for(var x in m.groups.VAR){
		    	x=m.groups.VAR[x];
		    	if(x=='<'){
					r += '[0-9 ]?';
				}else if(x=='#'){
		    		r += '[0-9]';
		    	}else if( x=='A'){
		    		r += '['+this.STRING[this.STRING_LNG]['A']+']';
		    	}else if( x=='Â'){
		    		r += '['+this.STRING[this.STRING_LNG]['A']+' ]';
		    	}else if( x=='a'){
		    		r += '['+this.STRING[this.STRING_LNG]['a']+']';
		    	}else if( x=='â'){
		    		r += '['+this.STRING[this.STRING_LNG]['a']+' ]';
		    	}else if( x=='*'){
		    		r += '.';
		    	}else{
		    		r += '\\'+x;
		    	}
		    }
		}
		return r;
	}


	// Obtain RegExp that is used to validate the data in OnChange
	static getValidationRexExp_P(pic){
		let r='',m=null;
		const regex = /(?<VAR>[^~])|(?<CONST>(~[^~]*~))/g;
		while ((m = regex.exec(pic.FORMAT)) !== null) {
		    if(m.index === regex.lastIndex)regex.lastIndex++;	// avoid infinite loops
		    if( m.groups.CONST!=undefined ){
		    	r += this.escapeRegExp( m.groups.CONST.replace(/~/g,'') );
		    	continue;
		    }
		    for(var x in m.groups.VAR){
		    	x=m.groups.VAR[x];
		    	if(x=='<'){
		    		r += '[0-9 ]?';
		    	}else if( x=='#'){
		    		r += '[0-9]{1}';
		    	}else if( x=='A'){
		    		r += '['+this.STRING[this.STRING_LNG]['A']+' ]{1}';
		    	}else if( x=='Â'){
		    		r += '['+this.STRING[this.STRING_LNG]['A']+']{1}';
		    	}else if( x=='a'){
		    		r += '['+this.STRING[this.STRING_LNG]['a']+' ]{1}';
		    	}else if( x=='â'){
		    		r += '['+this.STRING[this.STRING_LNG]['a']+']{1}';
		    	}else if( x=='*'){
		    		r += '.{1}';
		    	}else{
		    		r += '\\'+x;
		    	}
		    }
		}
		return '^'+r+'$';
	}
	// Obtain RegExp that is used to validate the data in OnKeypress
	static getTypingRexExp_P(pic){
		let a=[],b=[],c=[],r='',m=null;
		const regex = /(?<VAR>[^~])|(?<CONST>(~[^~]*~))/g;
		while ((m = regex.exec(pic.FORMAT)) !== null) {
		    if(m.index === regex.lastIndex)regex.lastIndex++;	// avoid infinite loops
		    let str1='';
		    let str2='';
		    if( m.groups.CONST!=undefined ){
		    	let z=m.groups.CONST.replace(/~/g,'').split('');
		    	for(var x in z ){
		    		a.push( new RegExp( '\\x'+ z[x].charCodeAt(0).toString(16), 'g') );
		    		b.push( z[x] );
		    		r += this.escapeRegExp( z[x] );
		    		c.push( '' );
		    	}
		    	continue;
		    }
		    for(var x in m.groups.VAR){
		    	x=m.groups.VAR[x];
		    	if(x=='<'){
		    		str1 = '[0-9 ]{1}';
		    	}else if( x=='#'){
		    		str1 = '[0-9]{1}';
		    	}else if( x=='A'){
		    		str1 = '['+this.STRING[this.STRING_LNG]['A']+' ]{1}';
		    	}else if( x=='Â'){
		    		str1 = '['+this.STRING[this.STRING_LNG]['A']+']{1}';
		    	}else if( x=='a'){
		    		str1 = '['+this.STRING[this.STRING_LNG]['a']+' ]{1}';
		    	}else if( x=='â'){
		    		str1 = '['+this.STRING[this.STRING_LNG]['a']+']{1}';
		    	}else if( x=='*'){
		    		str1 = '.{1}';
		    	}else{
		    		str1 = '\\x'+ x.charCodeAt(0).toString(16);
		    		str2 = x;
		    	}
		    	a.push( new RegExp(str1) );
		    	b.push( str2 );
		    	c.push(x);
		    }
		}
		return {PATTERNTYPING:r, TYPINGARRAYRE:a, TYPINGARRAY:b, TYPINGARRAY2:c };
	}

    /**
	 *  NUMBER_FORMAT taken from https://github.com/locutusjs/locutus/tree/main 
	 * by Kevin van Zonneveld and other authors.
	 * 
	**/
    static number_format(number, decimals, decPoint, thousandsSep) {
		number = (number + '').replace(/[^0-9+\-Ee.]/g, '')
		const n = !isFinite(+number) ? 0 : +number
		const prec = !isFinite(+decimals) ? 0 : Math.abs(decimals)
		const sep = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep
		const dec = (typeof decPoint === 'undefined') ? '.' : decPoint
		let s = ''
		const toFixedFix = function (n, prec) {
			if (('' + n).indexOf('e') === -1) {
				return +(Math.round(n + 'e+' + prec) + 'e-' + prec)
			} else {
				const arr = ('' + n).split('e')
				let sig = ''
				if (+arr[1] + prec > 0) {
					sig = '+'
				}
				return (+(Math.round(+arr[0] + 'e' + sig + (+arr[1] + prec)) + 'e-' + prec)).toFixed(prec)
			}
		}
		// @todo: for IE parseFloat(0.55).toFixed(0) = 0;
		s = (prec ? toFixedFix(n, prec).toString() : '' + Math.round(n)).split('.')
		if (s[0].length > 3) {
			s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep)
		}
		if ((s[1] || '').length < prec) {
			s[1] = s[1] || ''
			s[1] += new Array(prec - s[1].length + 1).join('0')
		}
		return s.join(dec)
    }


	/**
	 * DATE FUNCTIONS
	 * 
	**/
    static isLeapYear(y){	// es año bisiesto ?
        y=Number(y);
		return ((y&3)!=0)? false : ((y%100)!= 0||(y%400)==0);
    }
    // Get Day of Year
    static getDayOfYear(d,m){
        d=Number(d);
        m=Number(m);
        const dayCount = [0, 0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        const dayOfYear = dayCount[m] + d;
		return (m>2 && this.isLeapYear())? dayOfYear++ : dayOfYear;
    }
    static getDayOfWeek(v,format){
        return this.DATE_CONFIG[this.DATE_LNG][format][ new Date(v).getDay() ];
    }
    static getMonth(v,format){
        return this.DATE_CONFIG[this.DATE_LNG][format][ new Date(v).getMonth() ];
    }
    static getWeekOfYear(v){	//  ISO-8601
        let d=new Date(v);
        d=new Date( Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        let dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((d-yearStart)/86400000)+1)/7)
    }
    static getDaysInMonth(v){
        let d=new Date(v);
        return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate();
    }


	/**
	 * HOUR FUNCTIONS
	 * 
	**/
    static getAMPM(h,m,s){
        s=s||'00';
        if(m==undefined){
            var x=h.split(':');h=x[0];m=x[1];s=x[2]||'00';
        }
        return (h>=12)? 'PM':'AM';
    }
    static getampm(h,m,s){
        s=s||'00';
        if(m==undefined){
            var x=h.split(':');h=x[0];m=x[1];s=x[2]||'00';
        }
        return (h>=12)? 'pm':'am';
    }
	/**
	 * INIT DOM ELEMENT
	 * 
	**/
	static initElement( el, pic ){
		
		var pic = pic||el.getAttribute('pic');
		if( !this.re_isPic.test(pic) ) return false;
		try{
			var iv  = el.val();    
		}catch(e){
			var iv  = el.value;    
		}
		el.value= this.format( iv, pic ); 
		el.PIC  = this.getData(pic);
		if( el.PIC.PATTERN!='' ){
			if( el.PIC.TYPE=='D' ){
				el.addEventListener("blur"      ,this.onblur);
			}else if( el.PIC.TYPE=='D' ){
				el.addEventListener("blur"      ,this.onblur);
			}else if( el.PIC.TYPE=='P' ){
				this.initPatternValue(el);
				el.addEventListener("keypress"  ,this.onkeypressPattern);
				el.addEventListener("keydown"   ,this.onkeydownPattern);
				el.addEventListener("click"     ,this.onclickPattern);
				el.addEventListener("blur"      ,this.onblur);
			}else{
				el.addEventListener("blur"      ,this.onblur);
				el.addEventListener("change"    ,this.onchange);
				el.addEventListener("keypress"  ,this.onkeypress);
			}
			el.addEventListener("focus"     ,this.onfocus);
			el.addEventListener("paste"     ,this.onpaste);
		}
		if( el.PIC.TYPE=='S' && el.PIC.CASE!='' ){
			el.style.textTransform = (el.PIC.CASE=='U')? 'uppercase': (el.PIC.CASE=='L')? 'lowercase' : (el.PIC.CASE=='C')? 'capitalize' : 'initial';
		}
        el.val = el.rval =  function(v){
			if(v==undefined){
				//if(el.PIC.TYPE=='P')return this.value;
				return Picture.deformat( this.value, this.PIC.PICTURE );
			}
			el.setAttribute('value',v);
			this.value = Picture.format( v, this.PIC.PICTURE );
			return this.value;
		}
        el.format = function(val,pic){
			if(pic==undefined){
				if(el.PIC.TYPE=='P'){
					val = Picture.deformat(this.value, this.PIC.PICTURE);
				}else{
					val=val?? this.getAttribute('value');
				}
				return Picture.format( val , this.PIC.PICTURE );
			}
			val=val?? this.value;
			el.PIC.PICTURE=pic;
            return Picture.format( this.value, this.PIC.PICTURE );
        }
        el.isvalid = function(v){
			if(v==undefined){
				v = (el.PIC.TYPE=='P') ? this.value : this.val();
			}
			return this.PIC.PATTERNVALRE.test(v);
		}
		el.isempty = function(){
			var v=this.val();
			if(v=='')return true;
			if(this.PIC.TYPE=='N'){
				if(v*1==0)return true;
			}
			return false;
		}
		if( el.PIC.TYPE=='P' ){
			// Return variable data without pattern
			el.deformat = function(data){
				data = (data==undefined)? this.value : data;
				return Picture.deformat(data,el.PIC.PICTURE);
			}
		}
	}



	static initPatternValue (el){
		var s='';
		for(var x in el.PIC.TYPINGARRAY){
			s+=(el.PIC.TYPINGARRAY[x]=='')? ' ': el.PIC.TYPINGARRAY[x];
		}
		el.value=s;
	}

	static onfocus(event){
		var e   = event || window.event;
		var o   = e.currentTarget;
		if( o.PIC.TYPE!='D' && o.PIC.TYPE!='P')
			o.value = o.val();
		if( o.PIC.TYPE=='N'){
			o.style.textAlign = ( o.PIC.ALIGN=='R' )?  'right' : ( o.PIC.ALIGN=='C' )? 'center' : 'left';
			o.select();
		}else if( o.PIC.TYPE=='P'){
			o.value = o.format();
			for(var x in o.PIC.TYPINGARRAY){
				if(o.PIC.TYPINGARRAY[x]==''){
					e.target.selectionStart = e.target.selectionEnd = x;
					break;
				}
			}
		}else{
			o.select();
		}
	}

	static onblur(event){
		const e   = event || window.event;
		const o   = e.currentTarget;
		const pic = o.getAttribute('pic');
		const val = o.value;
		if( o.PIC.TYPE!='D' && o.PIC.TYPE!='T'){
			if( o.PIC.TYPE=='P' ){
				o.value = Picture.format( Picture.deformat(val, pic), pic );
			}else{
				o.value = o.format(val,pic);
			}
		}else{
			if( !o.PIC.PATTERNVALRE.test(o.val()) ){
				o.setAttribute('isvalid',false);
			}else{
				o.setAttribute('isvalid',true);
			}
		}
		if( o.PIC.TYPE=='N') o.style.textAlign = 'initial';
	}


	static onchange(event){
		const e   = event || window.event;
		const o   = e.currentTarget;
		o.setAttribute('value',o.value);
		if( o.PIC.TYPE=='D' ){
				e.returnValue = false;
			if( e.preventDefault )
				e.preventDefault();
		}
		if( o.PIC.TYPE!='D' && o.PIC.TYPE!='T' && !o.PIC.PATTERNVALRE.test(o.value) ){
			o.setAttribute('isvalid',false);
			return;
		}
		o.setAttribute('isvalid',true);
	}


	static onkeypress(event){
		const e   = event || window.event;
		let key = e.keyCode || e.which;
		const o   = e.currentTarget;
		key     = String.fromCharCode(key);
		if( !o.PIC.PATTERNRE.test(key) ){
				e.returnValue = false;
			if( e.preventDefault )
				e.preventDefault();
		}
		const ss  = e.target.selectionStart;
		const v   = o.value.substring(0,ss)+key+o.value.substring(ss);
		if( e.target.selectionStart==0 && e.target.selectionEnd==o.value.length ) return true;
		if( !o.PIC.PATTERNTYPINGRE.test( v ) ){
				e.returnValue = false;
			if( e.preventDefault )
				e.preventDefault();
		}
	}


	static onclickPattern(event){
		const e   = event || window.event;
		const o   = e.currentTarget;
		for(var x=e.target.selectionStart ; x<o.PIC.TYPINGARRAY.length ;x++){
			if(o.PIC.TYPINGARRAY[x]==''){
				e.target.selectionStart = x;
				break;
			}
		}


	}


	static onkeypressPattern(event){
		const e   = event || window.event;
		const keyc= e.keyCode || e.which;
		const o   = e.currentTarget;
		const key     = String.fromCharCode(keyc);
		// get old value
		const start 	 = e.target.selectionStart;
		const end 	 = e.target.selectionEnd;
		const oldValue = e.currentTarget.value;
		if( o.PIC.TYPINGARRAYRE[start]==undefined ){
				e.returnValue = false;
			if( e.preventDefault )
				e.preventDefault();
			return;
		}
		if( !o.PIC.TYPINGARRAYRE[start].test( key )  ){
				e.returnValue = false;
			if( e.preventDefault )
				e.preventDefault();
			return;
		}
		let append='';
		let xtart=start;
		let npos=0;
		while(1){
			xtart+=1;
			var nextChar = o.PIC.TYPINGARRAY[xtart];
			if(nextChar==undefined) break;
			if(nextChar!='' ){
				append += nextChar;
				npos+=1;
			}else{
				break;
			}
		}
		if( append!='' ){
			const newValue = oldValue.slice(0, start) + key + oldValue.slice(start+1)
			e.currentTarget.value = newValue;
			// replace cursor
			e.target.selectionStart = e.target.selectionEnd = start + npos +1;
			e.preventDefault();
			return;
		}
		const newValue = oldValue.slice(0, start) + key + oldValue.slice(start+1)
		e.currentTarget.value = newValue;
		// replace cursor
		e.target.selectionStart = e.target.selectionEnd = start + 1;
		e.returnValue = false;
		if( e.preventDefault )e.preventDefault();	
	}


	static onkeydownPattern (event){
		const e   = event || window.event;
		const key = e.keyCode || e.which;
		let o   = e.currentTarget;
		const keys   = String.fromCharCode(key);
		// get old value
		let start 	 = e.target.selectionStart;
		let end 	 = e.target.selectionEnd;
		let oldValue = e.currentTarget.value;
		if( key==8 ){	//Backspace
			if( o.PIC.TYPINGARRAY[start-1]!='' ){
				while( o.PIC.TYPINGARRAY[start-1]!=''){
					if(start-1<=1) break;
					start-=1;
				}
			}else{
				var newValue   = oldValue.slice(0, start-1) + ' ' + oldValue.slice(start);
				e.currentTarget.value = newValue;
				start -=1; 
			}
			e.target.selectionStart = e.target.selectionEnd = start;
			e.returnValue = false;
			if( e.preventDefault )e.preventDefault();	
		}else if( key==46 ){	//Delete
			let ov = oldValue;
			let spc='';
			for(var x=start; x<=end; x++){
				if(o.PIC.TYPINGARRAY[x]!='')continue;
				ov = Picture.setCharAt(ov,x,'~');
				spc+=' ';
			}
			for( x=0; x<ov.length; x++ ){
				if( o.PIC.TYPINGARRAY[x]!='' ){
					ov = Picture.setCharAt(ov,x,'~');
				}
			}
			ov= ov.replace(/~/g,'')+spc;
			for( x=0; x<ov.length; x++ ){
				if( o.PIC.TYPINGARRAY[x]!='' ){
					ov = ov.substring(0,x)+o.PIC.TYPINGARRAY[x]+ov.substring(x);
				}
			}
			e.currentTarget.value = ov;	//+spc;
			e.target.selectionStart = e.target.selectionEnd = start;
			e.returnValue = false; if( e.preventDefault )e.preventDefault();	
		}else if( key==36 ){			//Init
			if(e.shiftKey){
				e.target.selectionEnd=e.target.selectionStart;
				e.target.selectionStart=0;
				e.returnValue = false; if( e.preventDefault )e.preventDefault();
				return;
			}
			for(var x in o.PIC.TYPINGARRAY){
				if(o.PIC.TYPINGARRAY[x]==''){
					e.returnValue = false; if( e.preventDefault )e.preventDefault();
					e.target.selectionStart = e.target.selectionEnd = x;
					return;
				}
			}
		}else if( key==37 ){	//Left
			let xtart=start-1;
			while(1){
				if( o.PIC.TYPINGARRAY[xtart]=='' )break;
				if(xtart<=1){
					e.target.selectionStart = e.target.selectionEnd = start;
					e.returnValue = false; if( e.preventDefault )e.preventDefault();	
					break;
				}
				xtart-=1;
				e.target.selectionStart = e.target.selectionEnd = xtart+2;
			}
		}else if( key==39 ){	//Right
			let xtart=start;
			while(1){
				if( o.PIC.TYPINGARRAY[xtart]=='' )break;
				xtart+=1;
				e.target.selectionStart = e.target.selectionEnd = xtart-1;
				if(xtart>=e.currentTarget.value.length) break;
			}
		}
	}


	static onpaste(event){
		const e               = event || window.event;
		const o               = e.currentTarget;
		const clipboardData   = e.clipboardData || window.clipboardData;
		const pastedData      = clipboardData.getData('Text');
		if( o.PIC.TYPE=='S' ){
			navigator.clipboard.writeText(pastedData.substring(0,o.PIC.SIZE));
		}
		if( !o.PIC.PATTERNVALRE.test(pastedData) ){
				e.returnValue = false;
			if( e.preventDefault )
				e.preventDefault();
		}
	}
}
