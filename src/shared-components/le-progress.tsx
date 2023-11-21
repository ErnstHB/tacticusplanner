﻿import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import {
    ILegendaryEvent,
    ILegendaryEventBattle,
    ILegendaryEventProgressState,
    ILegendaryEventProgressTrack,
    ILegendaryEventTrackRequirement,
} from '../models/interfaces';
import { LeTrackProgress } from './le-track-progress';
import { LeProgressOverview } from './le-progress-overview';
import { LegendaryEventEnum } from '../models/enums';
import { Tooltip } from '@fluentui/react-components';
import { DispatchContext, StoreContext } from '../reducers/store.provider';

export const LeProgress = ({
    legendaryEvent,
    sectionChange,
}: {
    legendaryEvent: ILegendaryEvent;
    sectionChange: (value: string) => void;
}) => {
    const { leProgress } = useContext(StoreContext);
    const dispatch = useContext(DispatchContext);
    const [value, setValue] = React.useState(0);
    const [personalProgress, setPersonalProgress] = useState<ILegendaryEventProgressState>(
        leProgress[legendaryEvent.id] ?? {
            id: legendaryEvent.id,
            name: LegendaryEventEnum[legendaryEvent.id],
            alpha: {
                battles: Array.from({ length: 12 }, () => Array.from({ length: 7 }, () => false)),
            },
            beta: {
                battles: Array.from({ length: 12 }, () => Array.from({ length: 7 }, () => false)),
            },
            gamma: {
                battles: Array.from({ length: 12 }, () => Array.from({ length: 7 }, () => false)),
            },
            regularMissions: 0,
            premiumMissions: 0,
            bundle: 0,
            notes: '',
        }
    );

    const getTrackProgress = useCallback(
        (
            name: 'alpha' | 'beta' | 'gamma',
            killPoints: number,
            requirements: ILegendaryEventTrackRequirement[]
        ): ILegendaryEventProgressTrack => {
            const personalBattles = personalProgress[name].battles;
            const battlesPoints = legendaryEvent[name].battlesPoints;
            return {
                name,
                battles: personalBattles.map((state, index) => ({
                    battleNumber: index + 1,
                    state: Array.from({ length: 7 }).map((_, index) => state[index]),
                    requirements: [
                        {
                            name: 'Kill Points',
                            points: battlesPoints[index] ?? 0,
                            units: [],
                        },
                        {
                            name: 'Defeat All Enemies + High Score',
                            points: (battlesPoints[index] ?? 0) + killPoints,
                            units: [],
                        },
                        ...requirements,
                    ],
                })),
            };
        },
        []
    );

    const alphaProgress = useMemo(
        () => getTrackProgress('alpha', legendaryEvent.alpha.killPoints, legendaryEvent.alpha.unitsRestrictions),
        [legendaryEvent.id]
    );
    const betaProgress = useMemo(
        () => getTrackProgress('beta', legendaryEvent.beta.killPoints, legendaryEvent.beta.unitsRestrictions),
        [legendaryEvent.id]
    );
    const gammaProgress = useMemo(
        () => getTrackProgress('gamma', legendaryEvent.gamma.killPoints, legendaryEvent.gamma.unitsRestrictions),
        [legendaryEvent.id]
    );

    const handleBattlesChange =
        (section: 'alpha' | 'beta' | 'gamma') =>
        (battles: ILegendaryEventBattle[]): void => {
            setPersonalProgress(current => {
                const eventSection = current[section];
                eventSection.battles = battles.map(x => x.state);
                dispatch.leProgress({ type: 'Update', value: current, eventId: current.id });
                return current;
            });
        };

    const handleMissionsProgressChange = (section: 'regularMissions' | 'premiumMissions', value: number): void => {
        setPersonalProgress(current => {
            current[section] = value;
            dispatch.leProgress({ type: 'Update', value: current, eventId: current.id });
            return current;
        });
    };

    const handleNotesChange = (value: string): void => {
        setPersonalProgress(current => {
            current.notes = value;
            dispatch.leProgress({ type: 'Update', value: current, eventId: current.id });
            return current;
        });
    };

    const handleBundleChange = (value: number): void => {
        setPersonalProgress(current => {
            current.bundle = value;
            dispatch.leProgress({ type: 'Update', value: current, eventId: current.id });
            return current;
        });
    };

    const labelByIndex: Record<number, string> = {
        0: 'Overview',
        1: 'Alpha',
        2: 'Beta',
        3: 'Gamma',
    };

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        sectionChange(labelByIndex[newValue]);
    };

    const totalPoints = useMemo(() => {
        const alphaTotalPoints = alphaProgress.battles
            .flatMap(b => b.requirements)
            .map(x => x.points)
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const betaTotalPoints = betaProgress.battles
            .flatMap(b => b.requirements)
            .map(x => x.points)
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const gammaTotalPoints = gammaProgress.battles
            .flatMap(b => b.requirements)
            .map(x => x.points)
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        return alphaTotalPoints + betaTotalPoints + gammaTotalPoints;
    }, []);

    const getCurrentPoints = (trackProgress: ILegendaryEventProgressTrack) => {
        let total = 0;

        trackProgress.battles.forEach(battle => {
            battle.state.forEach((value, index) => {
                if (value) {
                    total += battle.requirements[index].points;
                }
            });
        });

        return total;
    };

    const currentPoints = useMemo(() => {
        const alphaTotalPoints = getCurrentPoints(alphaProgress);
        const betaTotalPoints = getCurrentPoints(betaProgress);
        const gammaTotalPoints = getCurrentPoints(gammaProgress);

        return alphaTotalPoints + betaTotalPoints + gammaTotalPoints;
    }, [value, personalProgress.premiumMissions]);

    const totalCurrency = useMemo(() => {
        return legendaryEvent.pointsMilestones
            .map(x => x.engramPayout)
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }, []);

    const currencyPerMission = useMemo(() => {
        const hasPremiumQuests = personalProgress.premiumMissions > 0;

        return hasPremiumQuests ? 25 + 15 : 25;
    }, [personalProgress.premiumMissions]);

    const regularMissionsCurrency = useMemo(() => {
        return personalProgress.regularMissions * currencyPerMission;
    }, [personalProgress.regularMissions, currencyPerMission]);

    const premiumMissionsCurrency = useMemo(() => {
        return personalProgress.premiumMissions * currencyPerMission;
    }, [personalProgress.premiumMissions, currencyPerMission]);

    const bundleCurrency = useMemo(() => {
        const additionalPayout = personalProgress.premiumMissions > 0 ? 15 : 0;
        return personalProgress.bundle ? personalProgress.bundle * 300 + additionalPayout : 0;
    }, [personalProgress.bundle, personalProgress.premiumMissions]);

    const currentCurrency = useMemo(() => {
        const currentMilestone = legendaryEvent.pointsMilestones.find(x => x.cumulativePoints >= currentPoints);
        if (!currentMilestone) {
            return 0;
        }

        const milestoneNumber =
            currentMilestone.cumulativePoints > currentPoints
                ? currentMilestone.milestone - 1
                : currentMilestone.milestone;

        return (
            legendaryEvent.pointsMilestones
                .filter(x => x.milestone <= milestoneNumber)
                .map(x => x.engramPayout)
                .reduce((accumulator, currentValue) => accumulator + currentValue, 0) +
            regularMissionsCurrency +
            premiumMissionsCurrency +
            bundleCurrency
        );
    }, [currentPoints, regularMissionsCurrency, premiumMissionsCurrency, bundleCurrency]);

    const totalChests = useMemo(() => {
        return legendaryEvent.chestsMilestones.length;
    }, []);

    const currentChests = useMemo(() => {
        let currencyLeft = currentCurrency;

        for (const chestMilestone of legendaryEvent.chestsMilestones) {
            if (currencyLeft >= chestMilestone.engramCost) {
                currencyLeft -= chestMilestone.engramCost;
            } else {
                return chestMilestone.chestLevel - 1;
            }
        }

        return legendaryEvent.chestsMilestones.length;
    }, [currentCurrency]);

    const chestsForUnlock = legendaryEvent.shardsToUnlock / legendaryEvent.shardsPerChest;

    const currencyForUnlock = useMemo(() => {
        return legendaryEvent.chestsMilestones
            .filter(x => x.chestLevel <= chestsForUnlock)
            .map(x => x.engramCost)
            .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }, []);

    const pointsForUnlock = useMemo(() => {
        const additionalPayout = personalProgress.premiumMissions > 0 ? 15 : 0;
        let currencyLeft = currencyForUnlock - regularMissionsCurrency - premiumMissionsCurrency - bundleCurrency;

        for (const chestMilestone of legendaryEvent.pointsMilestones) {
            currencyLeft -= chestMilestone.engramPayout + additionalPayout;
            if (currencyLeft <= 0) {
                return chestMilestone.cumulativePoints;
            }
        }

        return 0;
    }, [currencyForUnlock, regularMissionsCurrency, premiumMissionsCurrency, bundleCurrency]);

    const averageBattles = useMemo(() => {
        return (pointsForUnlock / 3 / 500).toFixed(2);
    }, [pointsForUnlock]);

    return (
        <div>
            <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto">
                <Tab value={0} label="Overview" />
                <Tab value={1} label="Alpha" />
                <Tab value={2} label="Beta" />
                <Tab value={3} label="Gamma" />
            </Tabs>
            <TabPanel value={value} index={0}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, margin: 10 }}>
                    <div style={{ display: 'flex', gap: 5 }}>
                        Deed Points for unlock:
                        <span style={{ fontWeight: 700 }}>
                            {' '}
                            {currentPoints} / {pointsForUnlock}
                        </span>
                        <Tooltip
                            content={totalPoints + ' in total. Battles per track: ' + averageBattles}
                            relationship={'description'}>
                            <InfoIcon />
                        </Tooltip>
                    </div>

                    <div style={{ display: 'flex', gap: 5 }}>
                        Currency for unlock:
                        <span style={{ fontWeight: 700 }}>
                            {' '}
                            {currentCurrency} / {currencyForUnlock}
                        </span>
                        <Tooltip content={totalCurrency + ' in total'} relationship={'description'}>
                            <InfoIcon />
                        </Tooltip>
                    </div>

                    <div style={{ display: 'flex', gap: 5 }}>
                        Chests for unlock:
                        <span style={{ fontWeight: 700 }}>
                            {' '}
                            {currentChests} / {chestsForUnlock}
                        </span>
                        <Tooltip content={totalChests + ' in total'} relationship={'description'}>
                            <InfoIcon />
                        </Tooltip>
                    </div>
                </div>
                <LeProgressOverview
                    legendaryEvent={legendaryEvent}
                    missionProgressChange={handleMissionsProgressChange}
                    notesChange={handleNotesChange}
                    bundleChange={handleBundleChange}
                    progress={{
                        alpha: alphaProgress,
                        beta: betaProgress,
                        gamma: gammaProgress,
                        regularMissions: personalProgress.regularMissions,
                        premiumMissions: personalProgress.premiumMissions,
                        notes: personalProgress.notes,
                        bundle: personalProgress.bundle ?? 0,
                    }}
                />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <LeTrackProgress trackProgress={alphaProgress} onStateUpdate={handleBattlesChange('alpha')} />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <LeTrackProgress trackProgress={betaProgress} onStateUpdate={handleBattlesChange('beta')} />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <LeTrackProgress trackProgress={gammaProgress} onStateUpdate={handleBattlesChange('gamma')} />
            </TabPanel>
        </div>
    );
};

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}>
            {value === index && <div>{children}</div>}
        </div>
    );
}
