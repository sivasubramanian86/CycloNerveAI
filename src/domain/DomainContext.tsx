/**
 * CycloNerveAI - Domain Context Provider
 * Supplies domain engines and repositories to React components via Dependency Injection.
 */

import React, { createContext, useContext, useMemo } from 'react';
import {
  IDependencyRepository,
  IInfrastructureRepository,
  IInterventionRepository,
  IScenarioRepository,
} from './types.ts';
import {
  InMemoryDependencyRepository,
  InMemoryInfrastructureRepository,
  InMemoryInterventionRepository,
  InMemoryScenarioRepository,
} from './repositories/InMemoryRepositories.ts';
import { RiskScoringEngine } from './risk/RiskScoringEngine.ts';
import { InfrastructureGraphEngine } from './graph/InfrastructureGraphEngine.ts';
import { InterventionEngine } from './intervention/InterventionEngine.ts';
import { CycloneCommander } from '../agent/CycloneCommander.ts';

interface DomainContainer {
  infraRepo: IInfrastructureRepository;
  edgeRepo: IDependencyRepository;
  interventionRepo: IInterventionRepository;
  scenarioRepo: IScenarioRepository;
  riskEngine: RiskScoringEngine;
  graphEngine: InfrastructureGraphEngine;
  interventionEngine: InterventionEngine;
  commander: CycloneCommander;
}

const defaultInfraRepo = new InMemoryInfrastructureRepository();
const defaultEdgeRepo = new InMemoryDependencyRepository();
const defaultInterventionRepo = new InMemoryInterventionRepository();
const defaultScenarioRepo = new InMemoryScenarioRepository();

const defaultContainer: DomainContainer = {
  infraRepo: defaultInfraRepo,
  edgeRepo: defaultEdgeRepo,
  interventionRepo: defaultInterventionRepo,
  scenarioRepo: defaultScenarioRepo,
  riskEngine: new RiskScoringEngine(),
  graphEngine: new InfrastructureGraphEngine(defaultInfraRepo, defaultEdgeRepo),
  interventionEngine: new InterventionEngine(
    defaultInfraRepo,
    defaultEdgeRepo,
    defaultInterventionRepo
  ),
  commander: new CycloneCommander(),
};

const DomainContext = createContext<DomainContainer>(defaultContainer);

export const DomainProvider: React.FC<{
  children: React.ReactNode;
  container?: Partial<DomainContainer>;
}> = ({ children, container }) => {
  const value = useMemo(() => {
    if (!container) return defaultContainer;

    const infraRepo = container.infraRepo || defaultInfraRepo;
    const edgeRepo = container.edgeRepo || defaultEdgeRepo;
    const interventionRepo = container.interventionRepo || defaultInterventionRepo;
    const scenarioRepo = container.scenarioRepo || defaultScenarioRepo;

    return {
      infraRepo,
      edgeRepo,
      interventionRepo,
      scenarioRepo,
      riskEngine: container.riskEngine || new RiskScoringEngine(),
      graphEngine: container.graphEngine || new InfrastructureGraphEngine(infraRepo, edgeRepo),
      interventionEngine:
        container.interventionEngine ||
        new InterventionEngine(infraRepo, edgeRepo, interventionRepo),
      commander: container.commander || new CycloneCommander(),
    };
  }, [container]);

  return <DomainContext.Provider value={value}>{children}</DomainContext.Provider>;
};

export function useDomain(): DomainContainer {
  return useContext(DomainContext);
}
