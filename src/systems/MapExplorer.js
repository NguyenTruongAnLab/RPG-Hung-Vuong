/**
 * MapExplorer - System for exploring the world of Văn Lang
 */

export class MapExplorer {
    constructor() {
        this.currentLocation = 'village';
        this.discoveredLocations = ['village'];
        this.locations = this.generateLocations();
    }

    generateLocations() {
        return {
            village: {
                id: 'village',
                name: 'Làng Lạc Việt',
                description: 'Ngôi làng của người Lạc Việt, nơi bắt đầu hành trình',
                encounters: [],
                connections: ['forest', 'river']
            },
            forest: {
                id: 'forest',
                name: 'Rừng Thần',
                description: 'Rừng rậm với nhiều thần thú Mộc và Kim',
                encounters: ['char001', 'char002', 'char041', 'char042'],
                connections: ['village', 'mountain']
            },
            river: {
                id: 'river',
                name: 'Sông Hồng',
                description: 'Dòng sông linh thiêng với thần thú Thủy',
                encounters: ['char081', 'char082', 'char083'],
                connections: ['village', 'lake']
            },
            mountain: {
                id: 'mountain',
                name: 'Núi Tản Viên',
                description: 'Ngọn núi thiêng nơi Sơn Tinh ngự trị',
                encounters: ['char161', 'char162', 'char163'],
                connections: ['forest', 'sanctuary']
            },
            lake: {
                id: 'lake',
                name: 'Hồ Tây',
                description: 'Hồ nước rộng lớn với thần thú hiếm',
                encounters: ['char084', 'char085', 'char086'],
                connections: ['river', 'sanctuary']
            },
            sanctuary: {
                id: 'sanctuary',
                name: 'Thánh Địa Hùng Vương',
                description: 'Nơi linh thiêng nhất của Văn Lang',
                encounters: ['char199', 'char200'],
                connections: ['mountain', 'lake']
            }
        };
    }

    moveTo(locationId) {
        if (this.canMoveTo(locationId)) {
            this.currentLocation = locationId;
            
            if (!this.discoveredLocations.includes(locationId)) {
                this.discoveredLocations.push(locationId);
            }
            
            return this.locations[locationId];
        }
        return null;
    }

    canMoveTo(locationId) {
        const current = this.locations[this.currentLocation];
        return current && current.connections.includes(locationId);
    }

    getCurrentLocation() {
        return this.locations[this.currentLocation];
    }

    getRandomEncounter() {
        const location = this.getCurrentLocation();
        if (location.encounters.length === 0) {
            return null;
        }
        
        const randomIndex = Math.floor(Math.random() * location.encounters.length);
        return location.encounters[randomIndex];
    }

    getAvailableLocations() {
        const current = this.locations[this.currentLocation];
        return current.connections.map(id => this.locations[id]);
    }
}
