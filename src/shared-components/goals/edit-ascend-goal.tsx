﻿import React, { useMemo } from 'react';
import { RaritySelect } from 'src/shared-components/rarity-select';
import { StarsSelect } from 'src/shared-components/stars-select';
import { CampaignLocation } from 'src/shared-components/goals/campaign-location';
import { CampaignsUsageSelect } from 'src/shared-components/goals/campaings-usage-select';
import { CampaignsLocationsUsage, Rarity, RarityStars } from 'src/models/enums';
import { NumbersInput } from 'src/shared-components/goals/numbers-input';
import { rarityToMaxStars, rarityToStars } from 'src/models/constants';
import { getEnumValues } from 'src/shared-logic/functions';
import { ICampaignBattleComposed } from 'src/models/interfaces';
import { ICharacterAscendGoal } from 'src/v2/features/goals/goals.models';

interface Props {
    goal: ICharacterAscendGoal;
    possibleLocations: ICampaignBattleComposed[];
    unlockedLocations: string[];
    onChange: (key: keyof ICharacterAscendGoal, value: number) => void;
}

export const EditAscendGoal: React.FC<Props> = ({ goal, possibleLocations, unlockedLocations, onChange }) => {
    const rarityValues = useMemo(() => {
        return getEnumValues(Rarity).filter(x => x >= goal.rarityStart);
    }, [goal.rarityStart]);

    const starsEntries = useMemo(() => {
        const maxStars = rarityToMaxStars[goal.rarityStart];
        return getEnumValues(RarityStars).filter(x => x >= goal.starsStart && x <= maxStars);
    }, [goal.starsStart, goal.rarityStart]);

    const starsTargetEntries = useMemo(() => {
        const minStars = rarityToStars[goal.rarityEnd];
        const maxStars = rarityToMaxStars[goal.rarityEnd];
        return getEnumValues(RarityStars).filter(x => x >= minStars && x <= maxStars);
    }, [goal.rarityEnd]);

    return (
        <>
            <div className="flex-box gap10 full-width">
                <RaritySelect
                    label={'Current Rarity'}
                    rarityValues={rarityValues}
                    value={goal.rarityStart}
                    valueChanges={value => onChange('rarityStart', value)}
                />

                <RaritySelect
                    label={'Target Rarity'}
                    rarityValues={rarityValues}
                    value={goal.rarityEnd}
                    valueChanges={value => onChange('rarityEnd', value)}
                />
            </div>

            <div className="flex-box gap10 full-width">
                <StarsSelect
                    label={'Current stars'}
                    starsValues={starsEntries}
                    value={goal.starsStart}
                    valueChanges={value => onChange('starsStart', value)}
                />
                <StarsSelect
                    label={'Target stars'}
                    starsValues={starsTargetEntries}
                    value={goal.starsEnd ?? starsTargetEntries[0]}
                    valueChanges={value => onChange('starsEnd', value)}
                />
            </div>

            <div className="flex-box gap5 wrap">
                {possibleLocations.map(location => (
                    <CampaignLocation
                        key={location.id}
                        location={location}
                        unlocked={unlockedLocations.includes(location.id)}
                    />
                ))}
            </div>

            {!!possibleLocations.length && (
                <div className="flex-box gap10 full-width">
                    <div style={{ width: '50%' }}>
                        <CampaignsUsageSelect
                            disabled={!unlockedLocations.length}
                            value={goal.campaignsUsage ?? CampaignsLocationsUsage.LeastEnergy}
                            valueChange={value => onChange('campaignsUsage', value)}
                        />
                    </div>
                    <div style={{ width: '50%' }}>
                        <NumbersInput
                            title="Shards per onslaught"
                            helperText="Put 0 to ignore Onslaught raids"
                            value={goal.onslaughtShards}
                            valueChange={value => onChange('onslaughtShards', value)}
                        />
                    </div>
                </div>
            )}

            {!possibleLocations.length && (
                <div className="flex-box gap10 full-width">
                    <NumbersInput
                        title="Shards per onslaught"
                        helperText="You should put more than 0 to be able to create the goal"
                        value={goal.onslaughtShards}
                        valueChange={value => onChange('onslaughtShards', value)}
                    />
                </div>
            )}
        </>
    );
};
