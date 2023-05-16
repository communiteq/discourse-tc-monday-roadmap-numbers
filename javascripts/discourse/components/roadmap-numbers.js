import Component from '@glimmer/component';
import { withPluginApi } from "discourse/lib/plugin-api"
import { tracked } from '@glimmer/tracking';
import { ajax } from "discourse/lib/ajax";

export default class RoadmapNumbers extends Component {
    @tracked mustShow = false;
    @tracked tags = [];
    @tracked roadmapCount = 0;
    @tracked releasedCount = 0;
    @tracked considerCount = 0;

    constructor() {
        super(...arguments);
        withPluginApi("0.3.0", (api) => {
            this.router = api.container.lookup('service:router');
            api.onPageChange((url, title) => {
                var routeInfo = this.router.recognize(url);
                if ((routeInfo.name == 'tags.showCategory') || (routeInfo.name == 'tags.showCategoryNone') || (routeInfo.name == 'discovery.category')) {
                    var param = routeInfo.params.category_slug_path_with_id || '';
                    if (param.startsWith(settings.category_slug)) {
                        this.mustShow = true;
                    } else {
                        this.mustShow = false;
                    }
                }
                else {
                    this.mustShow = false;
                }
                if (this.mustShow) {
                    ajax(`/tags.json`).then((tags) => {
                        const rootTags = tags.tags;
                        const tagGroupsTags = tags.extras.tag_groups.flatMap(group => group.tags);
                        const allTags = [...rootTags, ...tagGroupsTags];

                        const roadmapTag = allTags.find(obj => obj.name === 'on-roadmap');
                        this.roadmapCount = roadmapTag.count || 0;
                        const releasedTag = allTags.find(obj => obj.name === 'released');
                        this.releasedCount = releasedTag.count || 0;
                        const considerTag = allTags.find(obj => obj.name === 'under-consideration');
                        this.considerCount = considerTag.count || 0;
                    });
                }
            });
        });
    }

    get showComponent() {
        return this.mustShow;
    }
}
