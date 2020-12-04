from airsift.users.wagtail_utils import InfoPanel
from django.db import models
from django.db.models import ForeignKey
from wagtail.core.models import Page
from wagtail.core.fields import RichTextField
from wagtail.admin.edit_handlers import FieldPanel, HelpPanel, MultiFieldPanel
from wagtail.images.edit_handlers import ImageChooserPanel
from markdown import markdown

# Create your models here.
class DataStory(Page):
    class Meta:
        verbose_name_plural = 'Data Stories'

    show_in_menus_default = True
    feature_image = ForeignKey('wagtailimages.image', on_delete=models.DO_NOTHING, related_name='+')

    '''
    Intro
    '''
    introduction_copy = RichTextField(
        blank=False, null=False,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    '''
    Section 1: Location
    '''
    location_copy = RichTextField(
        blank=False, null=False,
        # features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    '''
    Section 2: Is there evidence?
    '''
    evidenceofproblem_copy = RichTextField(
        blank=False, null=False,
        # features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    '''
    Section 3: Character of Problem
    '''
    characterofproblem_copy = RichTextField(
        blank=False, null=False,
        # features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    '''
    Section 4: Drawing it all together
    '''
    evidencesummary_copy = RichTextField(
        blank=False, null=False,
        # features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    '''
    Section 5: Actions
    '''
    actions_copy = RichTextField(
        blank=False, null=False,
        # features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )

    '''
    Misc
    '''
    acknowledgements_copy = RichTextField(
        blank=True, null=True,
        features=['bold', 'italic', 'link', 'ol', 'ul', 'image', 'blockquote']
    )
    # TODO: location_name
    # TODO: Date From
    # TODO: Date To
    # TODO: Related Dustboxes
    # TODO: Related Data Stories

    content_panels = Page.content_panels + [
        HelpPanel(markdown('''
## What is a Data Story?

Data Stories draw together different kinds of evidence to narrate the impact that air pollution is having in your area. You can group together multiple forms of evidence that might include citizen data, regulatory data, weather data, local observations and other kinds of visual and auditory media. Monitoring studies normally start from a series of questions that you want to ask about your local air quality. For more guidance on this, please refer to the AirKit Logbook [link to section]. You may have also identified different sources of data to identify possible sources of pollution and develop actions for improving local air quality. This guide will assist you in writing a Data Story on Airsift.

## Writing Your Data Story

Writing a Data Story is a detailed and collaborative process that will likely require several iterations and revisions. The instructions below can act as a guideline to help you structure and complete a Data Story based on citizen data. You can see this structure in action by browsing these [link] published Data Stories. It can be helpful to include images of your local area in the data story to illustrate the landscape, highlight visible pollution and activity, or demonstrate how and where sensors are installed.
        ''')),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
At the start of the data story, it is useful to give a summary of the key findings and the data used in your Data Story. This section should be short at around 1–2 paragraphs.
                ''')),
                FieldPanel('title'),
                ImageChooserPanel('feature_image'),
                FieldPanel('introduction_copy', classname="full"),
            ],
            heading="0) Introduction",
            classname="collapsible collapsed primary-sections"
        ),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
In the early stages of your project, you will have considered the local area and possible pollution sources. Begin this section by offering some context and background on the area that you are monitoring.
                ''')),
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
                '''), classname='markdown'),
                FieldPanel('evidenceofproblem_copy', classname="full"),
            ],
            heading="2) Is There Evidence of a Problem",
            classname="collapsible collapsed primary-sections"
        ),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
In this section you can use Airsift to identify the times of day and weather conditions where PM2.5 concentrations are most prevalent. Using a combination of analysis methods will allow you to identify likely sources of particulates. It is important to include images of plots of charts here to illustrate your analysis. Plots can be downloaded or copied from the Analytics tool in Airsift.

### When is the source most evident?
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
                '''), classname='markdown'),
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
'''), classname='markdown'),
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
'''), classname='markdown'),
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
 '''), classname='markdown'),
                FieldPanel('acknowledgements_copy', classname="full"),
            ],
            heading="Data Story Acknowledgements",
            classname="collapsible collapsed primary-sections"
        ),
        MultiFieldPanel(
            [
                HelpPanel(markdown('''
Once you have finished writing your data story, you can publish it on the Airsift platform through the following steps:

* To create a data story first select 'Create Story' in the navigation bar at the top of the Airsift site.
* Select a title for your story, keeping it simple, short and descriptive.
* Use the text-box to create an outline for your Data Story, following the above instructions.
* Using the tool-bar you can add simple formatting to text (i.e. bold, italics etc.), add links to other media, and insert images and tables.
* You can upload images from your computer or copy and paste plots from Analytics.
* Follow the structure outlined in the text box to complete your data story.
* Some instructions for producing your data story are given in the right-hand-side of this page.
* You can view and read published data stories here [link: https://citizensense.net/data-stories-deptford/]. [**update to include AirKit data stories also?**]
'''), classname='markdown')
            ],
            heading='Publishing your Data Story'
        )
    ]

    promote_panels = []

    settings_panels = []
