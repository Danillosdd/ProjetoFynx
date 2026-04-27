import { Entity } from './entity.js';

export abstract class AggregateRoot<T> extends Entity<T> {
  // Aqui poderíamos adicionar lógica de Domain Events no futuro (Fase 6)
}
