// Shared by collection previews and the editor so launch always matches the card.
export const designs = [
 {id:'atelier',name:'The Atelier',caption:'Four woods. A different rhythm at every turn.',kind:'triangle',faceWoods:['maple','purpleheart','walnut','cherry'],width:12,length:16,size:2,alternate:true,border:.375,borderWood:'walnut',border2:.125,borderWood2:'maple',border3:0,border4:0},
 {id:'perspective',name:'Perspective',caption:'Three tones become a little optical illusion.',kind:'cube',faceWoods:['maple','sapele','walnut'],width:12,length:16,size:1.25,alternate:false,border:.5,borderWood:'walnut',border2:.125,borderWood2:'maple',border3:0,border4:0},
 {id:'heirloom',name:'The Heirloom',caption:'Nested diamonds, framed like a keepsake.',kind:'laminated',faceWoods:[...Array(4).fill('purpleheart'),...Array(4).fill('maple'),...Array(4).fill('walnut'),'maple'],width:12,length:18,size:3,alternate:false,border:.375,borderWood:'cherry',border2:.625,borderWood2:'purpleheart',border3:.125,borderWood3:'maple',border4:.375,borderWood4:'walnut'},
 {id:'daybreak',name:'Daybreak',caption:'Warm cherry and maple, with a walnut accent.',kind:'triangle',faceWoods:['maple','cherry','sapele','walnut'],width:14,length:18,size:2.5,alternate:false,border:.5,borderWood:'cherry',border2:0,border3:0,border4:0},
 {id:'monochrome',name:'Light & Shadow',caption:'Maple, oak, and walnut. A study in depth.',kind:'cube',faceWoods:['maple','oak','walnut'],width:12,length:15,size:1,alternate:false,border:.375,borderWood:'walnut',border2:0,border3:0,border4:0},
 {id:'cinder',name:'Cinder',caption:'Quiet geometry with a warm, dark frame.',kind:'laminated',faceWoods:[...Array(4).fill('walnut'),...Array(4).fill('sapele'),...Array(4).fill('maple'),'walnut'],width:12,length:16,size:2.5,alternate:false,border:.5,borderWood:'walnut',border2:.125,borderWood2:'sapele',border3:0,border4:0}
];
export function designConfig(design){
 const c={thickness:1.5,allowance:.125,kerf:.125,endTrim:.25,stockLength:36,border:0,border2:0,border3:0,border4:0,borderWood:'walnut',borderWood2:'maple',borderWood3:'maple',borderWood4:'walnut',rotations:{},...structuredClone(design)};
 if(c.kind==='triangle'){c.kind='laminated';c.barAssembly='squares';c.barShaping='bevel45';c.alternate=false;c.quarterTurns=[0,1,2,3];c.size*=2;const A=c.faceWoods.map(wood=>({wood,weight:1}));c.laminatedBars={A,B:structuredClone(A)};c.quarterBars=['A','A','A','A'];}
 if(c.kind==='laminated'&&!c.laminatedBars){const A=[0,4,8,12].map((index,i)=>({wood:c.faceWoods[index],weight:[50,16,16,18][i]}));c.laminatedBars={A,B:structuredClone(A).reverse()};c.quarterBars=['A','A','A','A'];}
 return c;
}
