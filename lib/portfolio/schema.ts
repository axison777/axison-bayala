import { z } from "zod";
const text = (max=500) => z.string().trim().min(1,"Ce champ est requis.").max(max);
const optionalText = z.string().trim().max(3000).optional();
const asset = z.string().max(1000).refine(v => /^\/(?!\/)[a-zA-Z0-9/_.,%() -]+$/.test(v) || /^https:\/\//.test(v) && (()=>{try{return !!new URL(v).hostname}catch{return false}})(), "Utilise un chemin local /… ou une URL HTTPS.");
const social = z.string().max(1000).refine(v => v==="" || /^https:\/\//.test(v) && (()=>{try{return !!new URL(v).hostname}catch{return false}})(), "URL HTTPS requise.");
const base = {id:text(100),visible:z.boolean()};
export const projectCategories = ["Frontend", "Backend", "Mobile", "UI/UX", "Réseaux & maintenance"] as const;
export const icons = ["Code2","Layers","Network","Database","RefreshCw","HeartHandshake","Sparkles","Video"] as const;
export const contentSchema = z.object({
 profile:z.object({name:text(100),cardFirstName:text(60),cardLastName:text(60),role:text(120),cardRole:text(60),intro:text(700),location:text(150),email:z.string().email().max(200),phone:z.string().regex(/^\+?[\d ()-]{6,30}$/, "Numéro invalide."),whatsapp:z.string().regex(/^\+?[\d ()-]{6,30}$/, "Numéro invalide."),github:social,linkedin:social,photo:asset,cv:asset,aboutTitle:text(150),aboutSubtitle:text(150),aboutText:text(3000),aboutText2:text(3000),aboutNotes:z.array(text(200)).max(8)}),
 ratings:z.array(z.object({id:text(100),code:text(4),label:text(80),detail:text(200),value:z.number().int().min(1).max(99)})).length(6),
 ratingsConfirmed:z.boolean(),
 projects:z.array(z.object({...base,name:text(150),type:text(150),categories:z.array(z.enum(["Frontend","Backend","Mobile","UI/UX","Réseaux & maintenance","Web","Métier"])).min(1).max(4),tech:z.array(text(60)).max(15),company:text(150),description:text(700),detail:text(5000),visual:z.enum(["money","plant","erp","learning","crypgo","apec","cycle","private","rental","project","network"]),confidential:z.boolean().optional(),images:z.array(asset).max(12).optional(),mobileImages:z.array(asset).max(12).optional(),loginImage:asset.or(z.literal("")).optional(),role:optionalText})).max(100),
 experiences:z.array(z.object({...base,date:text(100),role:text(150),company:text(150),text:text(4000)})).max(100),
 formations:z.array(z.object({...base,title:text(200),school:text(150),date:text(100)})).max(100),
 skillGroups:z.array(z.object({...base,title:text(100),items:z.array(text(80)).max(40)})).max(15),
 services:z.array(z.object({...base,icon:z.enum(icons),title:text(150),text:text(1500),items:z.array(text(200)).max(12)})).max(30),
 expertises:z.array(z.object({...base,icon:z.enum(icons),title:text(150),text:text(1500),tags:text(500)})).max(12),
}).superRefine((data,ctx)=>{
 for(const key of ['ratings','projects','experiences','formations','skillGroups','services','expertises'] as const){const ids=data[key].map(x=>x.id);if(new Set(ids).size!==ids.length)ctx.addIssue({code:z.ZodIssueCode.custom,path:[key],message:'Les identifiants doivent être uniques.'});}
});
export type PortfolioContent = z.infer<typeof contentSchema>;
export type Project = PortfolioContent['projects'][number];
export function publicContent(content:PortfolioContent):PortfolioContent {
 const result=structuredClone(content);
 for(const key of ['projects','experiences','formations','skillGroups','services','expertises'] as const) (result[key] as {visible:boolean}[])=result[key].filter(x=>x.visible);
 result.projects=result.projects.map(p=>p.confidential?{...p,images:[],mobileImages:[],loginImage:undefined}:p);
 return result;
}
