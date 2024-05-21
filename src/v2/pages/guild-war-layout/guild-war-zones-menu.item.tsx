﻿import React from 'react';
import { MenuItem } from 'src/v2/models/menu-item';
import GuildWarIcon from 'src/assets/images/icons/guildWarMono.png';

export const guildWarZonesMenuItem = new MenuItem(
    'Zones',
    <img src={GuildWarIcon} width={24} height={24} alt="Guild War Zones" />,
    '/plan/guildWar/zones',
    'War zones'
);
