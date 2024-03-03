/**
 * intel hex format
 * RECORD MARK | ":"          (Doppelpunkt, ASCII-Kodierung 3AHEX)
 * RECLEN      | Datenlänge   Länge der Nutzdaten als zwei Hexadezimalziffern
 * LOAD OFFSET | Ladeadresse  16-Bit-Adresse (Big-Endian)
 * RECTYP      | Satztyp      Datensatztyp (00..05)
 * INFO/DATA   | Daten        Nutzdaten (RECLEN x 2 Zeichen)
 * CHKSUM      | Prüfsumme    Prüfsumme über den Datensatz (ohne Satzbeginn)
 *
 * RECTYP      + Description
 * 00          | Data
 * 01          | End Of File
 * 02          | Extended Segment Address
 * 03          | Start Segment Address
 * 04          | Extended Linear Address
 * 05          | Start Linear Address 
 * 
 * Extended Linear Address Records (HEX386)
 * Extended linear address records are also known as 32-bit address records and HEX386 records.
 * These records contain the upper 16 bits (bits 16-31) of the data address.
 * The extended linear address record always has two data bytes and appears as follows:
 * :02000004FFFFFC
 * where:
 * 02 is the number of data bytes in the record.
 * 0000 is the address field. For the extended linear address record, this field is always 0000.
 * 04 is the record type 04 (an extended linear address record).
 * FFFF is the upper 16 bits of the address.
 * FC is the checksum of the record and is calculated as
 * 01h + NOT(02h + 00h + 00h + 04h + FFh + FFh).
 */


var aHex = [];
aHex.push( ":100BA60082E0CF9108958091500690915106089564" );
aHex.push( ":100BB6000E9477020895CF93DF93EC010E94BD0255" );
aHex.push( ":100BC600FC01DE010D900020E9F711978A2F8C1B9E" );
aHex.push( ":100BD6008E3308F08DE390E004C03196299120838E" );
aHex.push( ":100BE6009F5F8917D0F70E949B02DF91CF910895EE" );
aHex.push( ":100BF6000E94BD0208950E94BA0286FB882780F9EA" );
aHex.push( ":0C0C060008950E94BA028695817008953E" );
aHex.push( ":100C12001F93CF93DF9318ED14BFC0E6D0E0188284" );
aHex.push( ":100C220014BF83E089830E94B304E0E0F4E0808192" );
aHex.push( ":100C3200886080838481877F84830E944A040E9423" );
aHex.push( ":100C420077020E94D1030E945E0314BF88818068EC" );
aHex.push( ":0A0C52008883DF91CF911F91089570" );
aHex.push( ":100C5C000E9409060E94400278940E94680461E098" );
aHex.push( ":100C6C0081E00E9476040E9445020E94640381E0A8" );
aHex.push( ":100C7C000E947E048111F7CF6AE081E00E94760425" );
aHex.push( ":0A0C8C0081E490E00E949B02EECF8D" );
aHex.push( ":100C9600216473702E633A626F6F74206572726F8F" );
aHex.push( ":0B0CA60072206465746563746564006F" );
aHex.push( ":100CB200EC010E9472060E947106CE010E94730628" );
aHex.push( ":060CC200CE010E946F0646" );
aHex.push( ":0C0CC800EE0FFF1F0590F491E02D099441" );
aHex.push( ":060CD40080E090ED0895A0" );
aHex.push( ":040CDA000C94000076" );
aHex.push( ":040CDE000E947A00F6" );
aHex.push( ":020CE200089573" );
aHex.push( ":020CE400089571" );
aHex.push( ":020CE60008956F" );
aHex.push( ":020CE800C0004A" );
aHex.push( ":00000001FF" );
//
class IntelHexReader
{
   constructor()
   {  this.Record = /:([0-9A-F]{2})([0-9A-F]{4})([0-9A-F]{2})([0-9A-F]{2,})([0-9A-F]{2})/;
      this.aHexData = []; 
      this.nAddrOffset = 0;
   }
   
   clear()
   {  this.aHexData = []; }

   /**
    * This function handles the record type 00 (data).
    * @param { } nRecLen 
    * @param {*} nRecAdr 
    * @param {*} sRecDat 
    */
   #handleRec00( nRecLen, nRecAdr, sRecDat )
   {
      let nRet = -1;
      let aDat = [];
      nRecAdr += nAddrOffset;
      if( 0 == ( sRecDat.length % 2 ) )
      {
         for( let n=0; n<sRecDat.length; n+=2 ) 
         {
            this.aHexData[nRecAdr] = parseInt( "0x"+sRecDat[n]+sRecDat[n+1] );
            nRecAdr++;
         };
         nRet = 0;
      }
      return nRet;
   }

   /**
    * This function handles the record type 04 (extended linear address record).
    * @param {*} nRecLen 
    * @param {*} nRecAdr 
    * @param {*} sRecDat 
    * @return    int       0/-1
    */
   #handleRec04( nRecLen, nRecAdr, sRecDat )
   {
      let nRet = -1;
      if( ( 2==nRecLen ) && ( 0==nRecAdr ) && ( 4==sRecDat.length ) )
      {
         this.nAddrOffset = parseInt( "0x"+sRecDat )*65536;
         nRet = 0;
      }
      return nRet;
   }

   /**
    * This function gets an intel-hex line and stores
    * the decoded byte in an internal data array.
    * @param   sRecord     an intel-hex line
    * @return  int         0   end-of-intel-hex File
    *                      >0  number of decoded bytes
    *                      -1  unknown inte-hex Record
    */    
   read( sRecord )
   {  let nRet = -1;
      let aData = this.Record.exec( sRecord );
      if( ( null != aData ) && ( 6 == aData.length ) )
      {
         let nRecLen = parseInt( "0x"+aData[1] );
         let nRecAdr = parseInt( "0x"+aData[2] );
         let nRecTyp = parseInt( "0x"+aData[3] );
         let sRecDat = aData[4];
         let nRetSum = parseInt( "0x"+aData[5] );
         //
         if( 0 == nRecTyp )
         {  nRet = this.#handleRec00( nRecLen, nRecAdr, sRecDat ); }
         else if( 1 == nRecTyp )
         {  nRet = 0; }
         else if( 4 == nRecTyp )
         {  nRet = this.#handleRec04( nRecLen, nRecAdr, sRecDat ); }
      }
      return nRet;
   }
   
   /**
    * This function returns an array with all the readen
    * data. The index of the array is the address and the 
    * value is the data byte as int.
    * @return  array    array of all readen data from intel-hex file
    */
   getData()
   {  return this.aHexData;   }
   
   /**
    * This function return an array of all addresses.
    * @return  array    array of addresses (int)
    */
   getAddr()
   {  return Object.keys( Hex.aHexData ).sort(); }
   
}

var Hex = new IntelHexReader();
aHex.forEach( (sHex) => 
{ 
   console.log( sHex );
   Hex.read( sHex );
} );

   
//
// Object.keys( aHexData ) get addresses
var nSegLen = 128;
var aSegDef = [];
for( let n=0; n<nSegLen; n++ ) { aSegDef.push( "" ); }
var aSeg = [];
for( let n=0; n<255; n++ ) { aSeg[n] = Array.from( aSegDef ); }
var aHexData = Hex.getData();
Hex.getAddr().forEach( (nAddr) => 
{  let nSeg = Math.floor( nAddr/nSegLen );
   let nPos = nAddr % nSegLen;
   aSeg[nSeg][nPos] = aHexData[nAddr];
} ); 
//
var nSegFill = 0xFF;
for( let nSeg=0; nSeg<255; nSeg++ )
{
   if( aSeg[nSeg].join("").trim().length > 0 )
   {
      for( let n=0; n<nSegLen; n++ )
      {  if( aSeg[nSeg][n] == "" ) aSeg[nSeg][n] = nSegFill; }
      console.log( "segment "+nSeg+" : data "+aSeg[nSeg] );
   }
}
