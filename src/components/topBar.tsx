import React, { Fragment } from 'react'
import { io } from 'socket.io-client'
import { routes } from '../config/routes'
import { Menu } from 'semantic-ui-react'
import { NavLink } from 'react-router-dom'

export const TopBar: React.FC = () => (
    <Menu compact icon borderless fixed='top' size='large'>
        <Menu.Item>
            <img alt="logo" src='/share/img/logoBadge.jpg' />
            <span style={{width: '32px'}}/>
            <span style={{fontWeight: 'bold'}}>Back Office</span>
        </Menu.Item>
        { Object.keys(routes).map((routeKey, index) => {
            const route = routes[routeKey]

            return route.hideFromNav ? undefined : (
                <Menu.Item as={NavLink} to={route.path} key={index}>
                    <span>{route.name}</span>
                </Menu.Item>
            )
        })}
    </Menu>
)