from django import forms
from django.db.models.fields import BooleanField, CharField, DateField, Field
from airsift.datastories.forms import MultipleChoiceModel, create_choices
from django.db import models
from django.db.models import ForeignKey
from wagtail.core.models import Page
from wagtail.core.fields import RichTextField
from wagtail.admin.edit_handlers import FieldPanel, FieldRowPanel, HelpPanel, MultiFieldPanel, ObjectList, TabbedInterface
from wagtail.images.edit_handlers import ImageChooserPanel
from markdown import markdown
from modelcluster.fields import ParentalManyToManyField
from wagtailautocomplete.edit_handlers import AutocompletePanel
from wagtail.core.models import PageRevision
from wagtailseo.models import SeoMixin, SeoType, TwitterCard
from django.utils.html import strip_tags

class DataStoryIndex(SeoMixin, Page):
    # Copy
    summary_text = RichTextField()

    content_panels = Page.content_panels + [
        FieldPanel('summary_text')
    ]

    # Editor
    show_in_menus_default = True
    promote_panels = SeoMixin.seo_panels

    # SEO
    seo_content_type = SeoType.WEBSITE
    seo_twitter_card = TwitterCard.SUMMARY
    seo_image_sources = [
        "og_image",
    ]
    seo_description_sources = [
        "search_description",
        "summary_text",
    ]
    @property
    def seo_description(self) -> str:
        """
        Gets the correct search engine and Open Graph description of this page.
        Override in your Page model as necessary.
        """
        for attr in self.seo_description_sources:
            if hasattr(self, attr):
                text = getattr(self, attr)
                if text:
                    return strip_tags(text)
        return ""


class DataStory(SeoMixin, Page):
    class Meta:
        verbose_name_plural = 'Data Stories'

    # SEO
    seo_content_type = SeoType.ARTICLE
    seo_twitter_card = TwitterCard.LARGE
    seo_description_sources = [
        "search_description",
        "introduction_copy",
        "location_copy",
        'evidenceofproblem_copy',
        'characterofproblem_copy',
        'evidencesummary_copy',
        'actions_copy',
        'acknowledgements_copy',
    ]
    seo_image_sources = [
        "og_image",
        "feature_image",
    ]

    @property
    def seo_description(self) -> str:
        """
        Gets the correct search engine and Open Graph description of this page.
        Override in your Page model as necessary.
        """
        for attr in self.seo_description_sources:
            if hasattr(self, attr):
                text = getattr(self, attr)
                if text:
                    return strip_tags(text)
        return ""

    # Editor
    show_in_menus_default = True

    # Copy
    feature_image = ForeignKey('wagtailimages.image', on_delete=models.DO_NOTHING, related_name='+', blank=True, null=True)
    location_name = CharField(max_length=500, blank=True, null=True, verbose_name='The general location or area this report covers')
    date_from = DateField(blank=True, null=True, verbose_name='Beginning of report timespan')
    date_to = DateField(blank=True, null=True, verbose_name='End of report timespan')

    '''
    Intro
    '''
    introduction_copy = RichTextField(
        blank=True, null=False,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote'],
        verbose_name='Write page section'
    )

    '''
    Section 1: Location
    '''
    location_copy = RichTextField(
        blank=True, null=False,
        # features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote'],
        verbose_name='Write page section'
    )

    # Land use

    # * How is the land currently being used? (select multiple)  <br>
    landuse_choices = create_choices(
        'Residential',
        'Retail',
        'Industry',
        'Agriculture',
    )
    landuse_options = MultipleChoiceModel(
        choices=landuse_choices,
        verbose_name='Are there any plans to change the use of the land in the future? (select multiple)'
    )

    landuse_description = RichTextField(
        blank=True,
        null=True,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    # * Are there any plans to change the use of the land in the future? (select multiple) <br>
    landuse_changes_planned_choices = create_choices(
        'Residential developments',
        'Industrial developments',
        'Development of green space',
        'Development of retail sites',
    )
    landuse_changes_planned_options = MultipleChoiceModel(
        choices=landuse_changes_planned_choices,
        verbose_name='Are there any plans to change the use of the land in the future? (select multiple)'
    )

    # Green space

    # * What kinds of public green space are in the area? [Y/N] <br>
    green_spaces_choices = create_choices(
        'Parks',
        'Nature reserve',
        'Woods or Forest',
    )
    green_spaces_options = MultipleChoiceModel(
        choices=green_spaces_choices,
        verbose_name='What kinds of public green space are in the area?'
    )

    # * Describe the available green space in further detail [small free text] <br>
    green_space_description = RichTextField(
        blank=True, null=True,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    # **Anthropogenic Activity**
    # Note the kinds of human activity that take place on the land.

    # * Industrial activity [Y/N]
    industrial_activity = BooleanField(blank=True, null=True)

    # * Describe this: [short free text].
    industrial_activity_description = RichTextField(
        blank=True, null=True,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    # * Waste disposal, recycling plants [Y/N]
    waste_disposal = BooleanField(blank=True, null=True)
    # * Describe this: [short free text].
    waste_disposal_description = RichTextField(
        blank=True, null=True,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    # * Agriculture [Y/N]
    agriculture = BooleanField(blank=True, null=True)
    # * Describe this: [short free text].
    agriculture_description = RichTextField(
        blank=True, null=True,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    # Local sources of particle pollution
    # Look at the area on the Airsift map. Here, add any possible sources of pollution. This will relate to the land use mentioned above, and might include transport, waste, industry as appropriate for the area. Include a snapshot of this map in your data story.

    # How might these sources impact local air-quality and what are the specific sources? [medium free text]
    impacting_sources_of_pollution_description = RichTextField(
        blank=True, null=True,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote'],
        verbose_name='How might these sources impact local air-quality and what are the specific sources?'
    )

    # How many Dusboxes are monitoring in the area? [number field].
    related_dustboxes = ParentalManyToManyField(
        'data.Dustbox',
        blank=True,
        null=True,
        verbose_name='Are there any Airsift Dustboxes monitoring this area?'
    )

    # Where are Dustboxes located (if known) <br>
    dustbox_location_choices = create_choices(
        'Roadside',
        'Garden',
        'Indoors',
    )
    dustbox_location_options = MultipleChoiceModel(
        choices=dustbox_location_choices,
        verbose_name='What kinds of public green space are in the area?'
    )

    # * Are there other citizen or regulatory monitors in your area? [Y/N]
    nearby_monitors_exists = BooleanField(blank=True, null=True)

    # * Are able to access and use the data produced by them, describe? [Y/N]
    nearby_monitors_data_available_exists = BooleanField(blank=True, null=True)

    # * What are the monitors in your area? [short free text].
    nearby_monitors_description = RichTextField(
        blank=True, null=True,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    # What regional sources of air pollution impact your local area?
    regional_pollution_choices = create_choices(
        'Agricultural',
        'Industrial',
        'Wildfire',
        'Volcanic'
    )
    regional_pollution_options = MultipleChoiceModel(
        choices=regional_pollution_choices,
        verbose_name='What regional sources of air pollution impact your local area? '
    )
    regional_pollution_sources_description = RichTextField(
        blank=True, null=True,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    # **Observations**
    # In this section, note any key observations from the monitoring period (and before). Observations can be used to help you understand some context behind the Dustbox data. The time and location of these events are important factors to note as they can help you identify possible sources of pollution. You can map observations on the Airsift platform [link] and view the observations from other contributors. It is also useful to meet as a group and discuss your shared observations as other observations and experiences may become apparent.
    # Observations might include unpleasant smells, sources of noise and visible sources of pollution such as smog, smoke and dust. It could also relate to visible activity such as construction work. Some residents might note the health effects of pollution. You could find news reports of fires, pollution warnings and other media that can help explain peaks in the data.

    # Community Discussion
    # * Did your community identify any observations based on your discussions? [Y/N]
    # * Did your community identify any observations based on your discussions? [long text field].
    community_observations = RichTextField(
        blank=True, null=True,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote'],
        verbose_name='Did your community identify any observations based on your discussions?'
    )

    # From Airsift
    # * Are there any local observations on Airsift from the monitoring period (and before) [Y/N].
    # * List the observations relevant to your data story. [link to observations?]
    related_observations = ParentalManyToManyField(
        'observations.Observation',
        blank=True,
        null=True,
        verbose_name='Are there any local observations on Airsift from the monitoring period (and before)'
    )

    '''
    Section 2: Is there evidence?
    '''
    evidenceofproblem_copy = RichTextField(
        blank=True, null=True,
        features=['h4', 'h5', 'bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote'],
        verbose_name='Write page section'
    )

    '''
    Section 3: Character of Problem
    '''
    characterofproblem_copy = RichTextField(
        blank=True, null=True,
        features=['h4', 'h5', 'bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote'],
        verbose_name='Write page section'
    )

    '''
    Section 4: Drawing it all together
    '''
    evidencesummary_copy = RichTextField(
        blank=True, null=True,
        features=['h4', 'h5', 'bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote'],
        verbose_name='Write page section'
    )

    '''
    Section 5: Actions
    '''
    actions_copy = RichTextField(
        blank=True, null=True,
        features=['h4', 'h5', 'bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote'],
        verbose_name='Write page section'
    )

    '''
    Misc
    '''
    acknowledgements_copy = RichTextField(
        blank=True, null=True,
        features=['h4', 'h5', 'bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote'],
        verbose_name='Write page section'
    )

    content_panels = Page.content_panels + [
        HelpPanel(markdown('''
# What is a Data Story?

Data Stories draw together different kinds of evidence to narrate the impact that air pollution is having in your area. You can group together multiple forms of evidence that might include citizen data, regulatory data, weather data, local observations and other kinds of visual and auditory media. Monitoring studies normally start from a series of questions that you want to ask about your local air quality. For more guidance on this, please refer to the AirKit Logbook [link to section]. You may have also identified different sources of data to identify possible sources of pollution and develop actions for improving local air quality. This guide will assist you in writing a Data Story on Airsift.

# Writing Your Data Story

Writing a Data Story is a detailed and collaborative process that will likely require several iterations and revisions. The instructions below can act as a guideline to help you structure and complete a Data Story based on citizen data. You can see this structure in action by browsing these [link] published Data Stories. It can be helpful to include images of your local area in the data story to illustrate the landscape, highlight visible pollution and activity, or demonstrate how and where sensors are installed.

1. Select a title for your story, keeping it simple, short and descriptive.
2. Click the sections below and follow the instructions to fill out the story.
3. Using the tool-bar you can add simple formatting to text (i.e. bold, italics etc.), add links to other media, and insert images and tables.
4. You can upload images from your computer or copy and paste plots from Analytics.
5. You can save your progress by selecting 'save draft', in the menu next to the 'publish'
6. You can [view and read published data stories here](/datastories)
        '''), classname='markdown'),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
At the start of the data story, it is useful to give a summary of the key findings and the data used in your Data Story. This section should be short at around 1–2 paragraphs.
                '''), classname='markdown help-compact'),
                ImageChooserPanel('feature_image'),
                FieldRowPanel([
                    FieldPanel('date_from'),
                    FieldPanel('date_to'),
                ]),
                FieldPanel('introduction_copy', classname="full"),
            ],
            heading="0) Introduction",
            classname="collapsible collapsed primary-sections"
        ),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
In the early stages of your project, you will have considered the local area and possible pollution sources. Begin this section by offering some context and background on the area that you are monitoring.
                '''), classname='help-compact markdown'),
                FieldPanel('location_name'),

                HelpPanel(markdown('''
# Land Use
                '''), classname='help-compact markdown'),
                # Land use
                FieldPanel(
                    'landuse_options',
                    widget=forms.CheckboxSelectMultiple(choices=landuse_choices)
                ),
                FieldPanel('landuse_description'),
                FieldPanel(
                    'landuse_changes_planned_options',
                    widget=forms.CheckboxSelectMultiple(choices=landuse_changes_planned_choices)
                ),

                # Green space
                HelpPanel(markdown('''
# Green Space
                '''), classname='help-compact markdown'),
                FieldPanel(
                    'green_spaces_options',
                    widget=forms.CheckboxSelectMultiple(choices=green_spaces_choices)
                ),
                FieldPanel('green_space_description'),

                # Antrho
                HelpPanel(markdown('''
# Anthropogenic Activity

Note the kinds of human activity that take place on the land.
                '''), classname='help-compact'),
                FieldPanel('industrial_activity', widget=forms.CheckboxInput),
                FieldPanel('industrial_activity_description'),
                FieldPanel('waste_disposal', widget=forms.CheckboxInput),
                FieldPanel('waste_disposal_description'),
                FieldPanel('agriculture', widget=forms.CheckboxInput),
                FieldPanel('agriculture_description'),

                HelpPanel(markdown('''
# Local sources of particle pollution

Look at the area on the Airsift map. Here, add any possible sources of pollution. This will relate to the land use mentioned above, and might include transport, waste, industry as appropriate for the area. Include a snapshot of this map in your data story.

Identify possible pollution sources including but not limited to:

- Construction and development sites.
- Waste treatment plants and refuse and recycling centres.
- Main roads and points of traffic congestion.
- Transport infrastructure such as train stations.
- Power stations, oil refineries and mining.
- Sites of agricultural activity.
- Sites of potential burning activity such as allotments.
- Factories and other industrial activity.
- Biogenic or geological sources of pollution (such as volcanoes, deserts, wildfires).

How might these sources impact local air-quality and what are the specific sources?
                '''), classname='help-compact markdown'),
                FieldPanel('impacting_sources_of_pollution_description'),

                FieldPanel(
                    'dustbox_location_options',
                    widget=forms.CheckboxSelectMultiple(choices=dustbox_location_choices)
                ),
                AutocompletePanel(
                    'related_dustboxes'
                ),

                # R
                HelpPanel(markdown('''
# Regional and global sources of particulate pollution

In this section, describe regional pollution sources for your area. Regional sources can be identified by looking at local pollution reporting mechanisms.
                '''), classname='help-compact markdown'),
                FieldPanel(
                    'regional_pollution_options',
                    widget=forms.CheckboxSelectMultiple(choices=regional_pollution_choices)
                ),
                FieldPanel('regional_pollution_sources_description',),

                # O
                HelpPanel(markdown('''
# Observations

In this section, note any key observations from the monitoring period (and before). Observations can be used to help you understand some context behind the Dustbox data. The time and location of these events are important factors to note as they can help you identify possible sources of pollution. You can map observations on the Airsift platform [link] and view the observations from other contributors. It is also useful to meet as a group and discuss your shared observations as other observations and experiences may become apparent.

Observations might include unpleasant smells, sources of noise and visible sources of pollution such as smog, smoke and dust. It could also relate to visible activity such as construction work. Some residents might note the health effects of pollution. You could find news reports of fires, pollution warnings and other media that can help explain peaks in the data.

## Community Discussion
                '''), classname='help-compact markdown'),
                FieldPanel('community_observations'),
                HelpPanel(markdown('''
## From Airsift
                '''), classname='help-compact markdown'),
                AutocompletePanel('related_observations'),

                # Other
                HelpPanel(markdown('''
# Other location details
                '''), classname='help-compact'),
                FieldPanel('location_copy', classname="full"),
            ],
            heading="1) Location",
            classname="collapsible collapsed primary-sections"
        ),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
This section can be adapted from existing story text to fit the context of your monitoring study. This includes a paragraph that explains what is meant by the Dustbox 2.0 device being an "indicative" monitor.

Here you should note any co-location activity of the monitors (before, after or ideally both) and the findings of this.

Note that whilst the World Health Organisation has established guidelines on PM2.5 exposure there is not safe level.

## How to establish evidence of elevated pollution

To establish whether there is evidence of elevated pollution in your area, you can follow these steps:

* Create a **line plot** for each Dustbox in your area for the monitoring period with 24 h mean.
* Review the peaks and baseline of the data.
* Are the World Health Organisation or local air-quality guidelines regularly breached?
* Is there any other data/information from your local authority or other monitoring projects that support this finding?
* You can also compare the data you have collected to other monitors for this period.
* If there are ambient monitors (those away from the roadside), you can compare and see if peaks are caused by local or regional sources of pollution.
* If pollution is local you will see a spike in your monitor where the ambient monitor is flat. If it is regional you will see similar peaks and troughs in both monitors.
                '''), classname='markdown help-compact'),
                FieldPanel('evidenceofproblem_copy', classname="full"),
            ],
            heading="2) Is There Evidence of a Problem",
            classname="collapsible collapsed primary-sections"
        ),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
In this section you can use Airsift to identify the times of day and weather conditions where PM2.5 concentrations are most prevalent. Using a combination of analysis methods will allow you to identify likely sources of particulates. It is important to include images of plots of charts here to illustrate your analysis. Plots can be downloaded or copied from the Analytics tool in Airsift.

## When is the source most evident?
**Time plots** can be used to analyze the times when pollution levels are most frequently elevated. Time plots aggregate PM2.5 concentrations according to time to indicate:

* Key patterns such as rush hours and traffic.
* Possible construction or industry sources.
* Regional pollution events due to seasonal variation

Create a plot for each of the Dustboxes in your monitoring study. Look for peaks across weekdays and weekends. If traffic is a source of pollution, you would expect to see peaks at times of increased congestion i.e. the morning and evening rush hour.

When you look at each plot consider how the Dustbox installation could impact the data. Dustboxes that are close to the roadside will often see higher peaks at rush hour. Those in the garden might show peaks at different times, for example barbecues on Sunday afternoons.

## Which direction is PM2.5 coming from?

**Scatter Plots of PM2.5 Concentrations and Wind Direction** can be used to gauge the location of emissions sources in relation to the Dustbox monitors. Particulate matter is carried by the wind from emissions sources to the monitoring area. Wind direction is given in degrees where 0 (o) is North and 180 (o) is South. Note the directions where the highest levels of pollution are recorded.

**Polar plots** can also illustrate this relationship. Colour contours reflect pollutant concentrations in relation to wind direction and wind speed. Calm conditions (zero wind) are shown in the centre, increasing up to 20 metres per second (ms-1) at the outer ring. The highest mean concentrations are shown in red, the lowest are in blue, in a dynamic scale.

* Look for patterns in the polar plots, are they similar across the different monitors?
* Where are the highest levels of pollutants coming from?
* Look at the satellite map and see if you can see any possible sources of these emissions.

## Under which weather conditions are PM2.5 levels most evident?

**Scatter Plots of PM2.5 Concentrations and Wind Speed** can be used to understand the relationship between wind speed and PM2.5 to identify if elevated levels are present at low winds, thereby indicating possible local emission source(s).

**Scatter Plots of PM2.5 Concentrations and Temperature** can be used to check if there is a positive or negative correlation between temperature and PM2.5. This can help in understanding the seasonal variation of PM2.5 with respect to temperature.

**Scatter Plots of PM2.5 Concentrations and Humidity** can be used to illustrate the relationship between PM2.5 and humidity. During high humidity, there would be fewer occurrences of wind-blown dust.

## Write up
                '''), classname='markdown help-compact'),
                FieldPanel('characterofproblem_copy', classname="full"),
            ],
            heading="3) Characterising The Problem",
            classname="collapsible collapsed primary-sections"
        ),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
This section brings together a bullet point list that summarises all the evidence presented throughout the previous sections.

* Summarise the sources of data that have been used in the study.
* Draw out the key findings of your analysis and observations to identify key sources of pollution.
* You may wish to note whether sources were mostly regional or local and where the pollution might be coming from.
'''), classname='markdown help-compact'),
                FieldPanel('evidencesummary_copy', classname="full"),
            ],
            heading="4) Drawing The Evidence Together",
            classname="collapsible collapsed primary-sections"
        ),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
Actions are recommendations for things that can be done to improve local air-quality and to mitigate the effects of pollution. The process of developing actions should be in dialogue with your community and through engagement with local policy and planning around infrastructure, development and industry. Consider what the main sources of pollution are and what kinds of actions would help improve air quality. It is likely that actions relating to a combination of these would improve your local air quality. This could be related to: traffic and transport; construction and development; green infrastructure; air quality monitoring; waste management; industry and/or agriculture.

For each source of pollution or intervention, investigate local policy and planning. Here you should consider ways in which existing policies or plans could be extended to improve air quality. For example:

* The local council may have plans to improve cycling infrastructure. The findings of your data story might highlight the need to extend this to a wider area.
* Your monitoring might identify an area where a green screen could notably improve air quality at a key community site.
* Your study might determine a potential source of pollution that requires further and more focussed monitoring.
'''), classname='markdown help-compact'),
                FieldPanel('actions_copy', classname="full"),
            ],
            heading="5) Actions",
            classname="collapsible collapsed primary-sections"
        ),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
In this space you can thank and acknowledge the contributions that different people or organisations have made to your Data Story and wider monitoring study.

* You may want to thank citizens, groups and initiatives that have helped.
* You may have received some financial or technical support with establishing the monitoring study.
* Ensure that you have permission to name any collaborator on your project.
 '''), classname='markdown help-compact'),
                FieldPanel('acknowledgements_copy', classname="full"),
            ],
            heading="Data Story Acknowledgements",
            classname="collapsible collapsed primary-sections"
        )
    ]

    promote_panels = []

    settings_panels = []

    edit_handler = TabbedInterface(
        [
            ObjectList(content_panels, heading='Content'),
        ]
    )

    def contributors(self):
        return list(set([
            revision.user
            for revision in PageRevision.objects.filter(page=self)
        ]))
