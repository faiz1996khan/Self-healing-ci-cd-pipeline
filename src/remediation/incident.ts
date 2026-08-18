import { randomUUID } from "node:crypto";
import { Incident } from "../models/incident";

const incidents = new Map<string,Incident>();

export function saveIncident(incident:Incident):void{
    incidents.set(incident.id,incident);
}

export function getIncident(id:string):Incident | undefined{
    return incidents.get(id)
}

export function updateIncident(id: string,update: Partial<Incident>):Incident{
  const existing = incidents.get(id);

  if (!existing) {
    throw new Error(`Incident ${id} not found`);
  }

  const updated = {...existing,...update};
  incidents.set(id,updated);

  return updated;
}

export function createIncidentId():string {
    return randomUUID();
}