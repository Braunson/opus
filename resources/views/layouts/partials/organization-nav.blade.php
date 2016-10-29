<div class="row">
    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
        <ul class="nav nav-pills" id="organization-nav">
            <li @if(\App\Helpers\ViewHelper::getCurrentRoute() == 'organizations/{organization_slug}') class="active" @endif><a href="{{ route('organizations.show', $organization->slug) }}">Organization</a></li>
            <li @if(\App\Helpers\ViewHelper::getCurrentRoute() == 'organizations/{organization_slug}/members') class="active" @endif><a href="{{ route('organizations.members', $organization->slug) }}">Members</a></li>
            @if(\App\Helpers\ViewHelper::userHasOrganization($organization->slug))
                <li @if(\App\Helpers\ViewHelper::getCurrentRoute() == 'organizations/{organization_slug}/activity') class="active" @endif><a href="{{ route('organizations.activity', $organization->slug) }}">Activity</a></li>
            @endif
            @if(\App\Helpers\ViewHelper::userHasOrganization($organization->slug))
                <li><a href="{{ route('organizations.wiki.create', $organization->slug) }}">Create Wiki</a></li>
            @endif
        </ul>
    </div>
</div>