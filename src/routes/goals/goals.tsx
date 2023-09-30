﻿import React, { useState } from 'react';
import { SetGoalDialog } from '../../shared-components/goals/set-goal-dialog';
import { ICharacter, IPersonalGoal } from '../../models/interfaces';
import { PersonalGoalType } from '../../models/enums';

import { useCharacters, usePersonalData } from '../../services';
import { RankImage } from '../../shared-components/rank-image';
import { RarityImage } from '../../shared-components/rarity-image';
import { CharacterTitle } from '../../shared-components/character-title';
import { Card, CardContent, CardHeader, ListItemIcon, Menu, MenuItem } from '@mui/material';
import IconButton from '@mui/material/IconButton';

import { DeleteForever, ArrowForward, MoreVert, Edit } from '@mui/icons-material';
import { bindMenu, bindTrigger, usePopupState } from 'material-ui-popup-state/hooks';
import ListItemText from '@mui/material/ListItemText';


export const Goals = () => {
    const { personalData, updateGoals } = usePersonalData();
    const [goals, setGoals] = useState<IPersonalGoal[]>(() => personalData.goals);

    const addGoal = (goal: IPersonalGoal | undefined): void => {
        if (goal) {
            setGoals(personalData.goals);
        }
    };

    const removeGoal = (goalId: string): void => {
        setGoals(currentGoals => {
            const result = currentGoals.filter(goal => goal.id !== goalId);
            updateGoals(result);
            return result;
        });
    };
    
    const handleMenuItemSelect = (goalId: string, item: 'edit' | 'delete') => {
        if(item === 'delete') {
            if (confirm('Are you sure? The goal will be permanently deleted!')) {
                removeGoal(goalId);
            }
        }
    };
    
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10 }}>
                <SetGoalDialog key={goals.length} onClose={addGoal}/>
                <span style={{ fontSize: 20 }}>{goals.length}/{20}</span>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }} className={'goals'}>
                {
                    goals.map((goal, index) =>   <GoalCard key={goal.id} goal={goal} priority={index + 1} menuItemSelect={item => handleMenuItemSelect(goal.id, item)}/>)
                }
            </div>
        </div>
    );
};

export default function GoalCard({ goal, priority, menuItemSelect }: { goal: IPersonalGoal, priority: number, menuItemSelect: (item: 'edit' | 'delete') => void }) {
    const menuState = usePopupState({ variant: 'popover', popupId: 'goalMenu' });
    const { characters } = useCharacters();
    const character = characters.find(x => x.name === goal.character) as ICharacter;

    return (
        <React.Fragment>
            <Card sx={{ width: 350, minHeight: 200, backgroundColor:  (goal.type === PersonalGoalType.UpgradeRank && goal.targetRank === character.rank) || (goal.type === PersonalGoalType.Ascend && goal.targetRarity === character.rarity) ? 'lightgreen' : 'white' }}>
                <CardHeader
                    action={
                        <IconButton aria-label="settings"  {...bindTrigger(menuState)}>
                            <MoreVert />
                        </IconButton>
                    }
                    title={ <div style={{ display: 'flex', gap: 5 }}><span>#{priority}</span> <CharacterTitle character={character} short={true} imageSize={30}/></div>}
                    subheader={PersonalGoalType[goal.type]}
                />
                <CardContent>
                    { 
                        goal.type === PersonalGoalType.UpgradeRank 
                            ? (
                                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <RankImage rank={character.rank}/>  <ArrowForward /> <RankImage rank={goal.targetRank ?? 0}/>
                                </div>
                            ) 
                            : undefined
                    }
    
                    {
                        goal.type === PersonalGoalType.Ascend
                            ? (
                                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <RarityImage rarity={character.rarity}/><ArrowForward /> <RarityImage rarity={goal.targetRarity ?? 0}/>
                                </div>
                            )
                            : undefined
                    }
                    <span>{goal.notes}</span>
                </CardContent>
            </Card>
            <Menu {...bindMenu(menuState)}>
                <MenuItem onClick={() => {
                    menuState.close();
                    menuItemSelect('edit');
                }}>
                    <ListItemIcon>
                        <Edit fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Edit</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    menuState.close();
                    menuItemSelect('delete');
                }}>
                    <ListItemIcon>
                        <DeleteForever fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Delete</ListItemText>
                </MenuItem>
            </Menu>
        </React.Fragment>
    );
}