﻿import { ICharacter2, IMaterialRecipeIngredientFull } from '../models/interfaces';
import React, { useContext, useState } from 'react';
import { CharacterTitle } from './character-title';
import Dialog from '@mui/material/Dialog';
import { DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { CharacterDetails } from '../mobile-routes/characters/character-details';
import Button from '@mui/material/Button';
import { DispatchContext } from '../reducers/store.provider';
import { UtilsService } from '../services/utils.service';
import { MiscIcon } from './misc-icon';

export const CharacterItem = (props: { character: ICharacter2 }) => {
    const [open, setOpen] = useState(false);
    const [character, setCharacter] = useState(() => ({ ...props.character }));
    const [inventoryUpdate, setInventoryUpdate] = useState<IMaterialRecipeIngredientFull[]>([]);

    const dispatch = useContext(DispatchContext);
    const saveChanges = () => {
        dispatch.characters({ type: 'Update', character });
        if (inventoryUpdate.length) {
            dispatch.inventory({
                type: 'DecrementUpgradeQuantity',
                upgrades: inventoryUpdate.map(x => ({ id: x.id, count: x.count })),
            });
        }
    };

    const handleClickOpen = () => {
        setCharacter({ ...props.character });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <div>
            <div onClick={handleClickOpen} style={{ cursor: 'pointer' }}>
                <CharacterTitle character={props.character} showLockedWithOpacity={true} wyo={true} />
            </div>

            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <CharacterTitle character={character} />
                        <div style={{ display: 'flex' }}>
                            <MiscIcon icon={'power'} height={20} width={15} />{' '}
                            {UtilsService.getCharacterPower(character)}
                        </div>
                    </div>
                </DialogTitle>
                <DialogContent style={{ paddingTop: 20 }}>
                    <CharacterDetails
                        character={character}
                        characterChanges={(character, updateInventory) => {
                            setCharacter(character);
                            setInventoryUpdate(updateInventory);
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button
                        onClick={() => {
                            saveChanges();
                            handleClose();
                        }}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};
